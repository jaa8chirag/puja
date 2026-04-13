import React from "react";
import { Info, ShieldCheck, ShieldAlert, FileText, Ban } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PolicySection = () => {
  const navigate = useNavigate();

  const policies = [
    {
      icon: <Info className="w-6 h-6 text-orange-600" />,
      title: "About Us",
      to: "/aboutUs",
      desc: "Learn about our sacred mission"
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-orange-600" />,
      title: "Privacy Policy",
      to: "/privacypolicy",
      desc: "How we protect your data"
    },
    {
      icon: <ShieldAlert className="w-6 h-6 text-orange-600" />,
      title: "Cancellation Policy",
      to: "/cancellationpolicy",
      desc: "Booking changes & refunds"
    },
    {
      icon: <FileText className="w-6 h-6 text-orange-600" />,
      title: "Terms & Conditions",
      to: "/termsandconditions",
      desc: "Rules for our services"
    },
    {
      icon: <Ban className="w-6 h-6 text-orange-600" />,
      title: "Discrimination Policy",
      to: "/discrimination",
      desc: "Our commitment to equality"
    }
  ];

  return (
    <section className="w-full bg-[#FFF4E1] py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
           <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#3d1500] mb-2">Our Policies</h2>
           <p className="text-gray-500 text-sm">Everything you need to know about our services</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {policies.map((policy, idx) => (
            <div 
              key={idx}
              onClick={() => navigate(policy.to)}
              className="bg-white p-6 rounded-2xl border border-orange-100 flex flex-col items-center text-center hover:shadow-xl hover:border-orange-300 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {policy.icon}
              </div>
              <h4 className="text-[14px] font-bold text-[#3b2a1a] mb-1 leading-tight">{policy.title}</h4>
              <p className="text-[10px] text-gray-400 font-medium">{policy.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PolicySection;
