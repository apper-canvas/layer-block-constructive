import { NavLink } from "react-router-dom";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const MobileSidebar = ({ isOpen, onClose, className = "" }) => {
  const navigation = [
    { name: "Dashboard", href: "", icon: "Home" },
    { name: "Contacts", href: "contacts", icon: "Users" },
{ name: "Leads", href: "leads", icon: "Target" },
    { name: "Deals", href: "deals", icon: "Briefcase" }
  ];

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      <div className={cn(
        "fixed left-0 top-0 h-full w-60 bg-primary text-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}>
        <div className="p-6 border-b border-blue-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 rounded-lg p-2">
                <ApperIcon name="Building2" size={24} className="text-white" />
              </div>
              <h1 className="text-xl font-bold">CRM Pro</h1>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ApperIcon name="X" size={20} className="text-white" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href === "" ? "/" : `/${item.href}`}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-white text-primary shadow-sm border-l-4 border-white"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    )
                  }
                >
                  <ApperIcon name={item.icon} size={18} />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-blue-600">
          <div className="flex items-center gap-3 text-sm text-white/60">
            <ApperIcon name="HelpCircle" size={16} />
            <span>Need help?</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;