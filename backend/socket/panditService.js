import { generateKundli } from '../controllers/kundliController.js';

// Global state to keep track of users
const userStates = new Map();

export const handlePanditLogic = async (socket, text, groq, PANDIT_PROMPT) => {
    // 1. Get or Create State
    if (!userStates.has(socket.id)) {
        userStates.set(socket.id, { step: 'chat', data: {}, history: [] });
    }
    let state = userStates.get(socket.id);


    try {
        // SCENARIO A: Agar details maangne ka process shuru ho chuka hai
        if (state.step === 'collecting') {
            const reply = await collectJanamDetails(socket, text, state, groq);
            userStates.set(socket.id, state); // Save state back
            return reply;
        }

        // SCENARIO B: Normal Chat - AI decides when to trigger Kundli
        const completion = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: PANDIT_PROMPT + `
                    CRITICAL INSTRUCTION:
                    - If the user mentions ANY problem (marriage, job, health, etc.), reply ONLY with the word 'ACTIVATE_KUNDLI_FLOW'.
                    - DO NOT ask for name, date, or time yourself.
                    - DO NOT say anything else if you see a problem.` 
                },
                ...state.history,
                { role: "user", content: text }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.2,
        });

        const aiReply = completion.choices[0]?.message?.content || "";

        // Check if AI triggered the flow
        if (aiReply.includes("ACTIVATE_KUNDLI_FLOW")) {
            state.step = 'collecting';
            state.subStep = 'name';
            userStates.set(socket.id, state);
            return "🙏 Om Namah Shivay! Is samasya ke vishleshan ke liye mujhe aapki kundli dekhni hogi. Kripya sabse pehle apna **Pura Naam (Full Name)** batayein.";
        }

        // Normal Chat History
        state.history.push({ role: "user", content: text });
        state.history.push({ role: "assistant", content: aiReply });
        if (state.history.length > 4) state.history.shift();
        userStates.set(socket.id, state);

        return aiReply;

    } catch (error) {
        console.error("Pandit Logic Error:", error);
        return "🙏 Kshama karein yajmaan, koshish jaari hai. Kripya punah prayas karein.";
    }
};

async function collectJanamDetails(socket, text, state, groq) {
    const steps = {
        name: { next: 'dob', msg: "Dhanyawad. Ab kripya apni **Janm Tithi** batayein (DD-MM-YYYY)." },
        dob: { next: 'tob', msg: "Uttam. Aapka **Janm Samay** kya hai? (HH:MM AM/PM)" },
        tob: { next: 'city', msg: "Aapka **Janm Sthan** (City) kaunsa hai?" },
        city: { next: 'gender', msg: "Ant mein, apna **Gender** (Male/Female) batayein." },
        gender: { next: 'complete', msg: "🙏 Prateeksha karein, grahon ki ganana ho rahi hai..." }
    };

    const currentSubStep = state.subStep;
    state.data[currentSubStep] = text;


    if (steps[currentSubStep].next !== 'complete') {
        state.subStep = steps[currentSubStep].next;
        return steps[currentSubStep].msg;
    } else {
        // FINAL EXECUTION
        try {
            const { name, dob, tob, city, gender } = state.data;

            const rawData = await generateKundli(name, dob, tob, city, gender, 5.5, 29.94, 78.16);
            const report = await interpretRawData(rawData, groq);
            
            // Reset State after finishing
            state.step = 'chat';
            state.data = {};
            state.subStep = null;
            
            return report;
        } catch (err) {
            console.error("Kundli Calculation Error:", err);
            state.step = 'chat';
            return "🙏 Ganana mein truti hui. Kripya naye sire se poochein.";
        }
    }
}

async function interpretRawData(data, groq) {
    const prompt = `Aap ek Vedic Astrologer hain. Is Kundli JSON ka vishleshan karke Hindi mein remedies aur report dein: ${JSON.stringify(data)}`;
    const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
    });
    return completion.choices[0].message.content;
}

export const clearUserState = (id) => userStates.delete(id);