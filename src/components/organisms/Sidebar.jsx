import { NavLink } from "react-router-dom";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Sidebar = ({ className = "" }) => {
  const navigation = [
    { name: "Dashboard", href: "", icon: "Home" },
    { name: "Contacts", href: "contacts", icon: "Users" },
    { name: "Leads", href: "leads", icon: "Target" }
  ];

  return (
    <div className={cn(
      "bg-primary text-white w-60 min-h-screen flex flex-col shadow-xl",
      className
    )}>
      <div className="p-6 border-b border-blue-600">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 rounded-lg p-2">
            <ApperIcon name="Building2" size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold">CRM Pro</h1>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href === "" ? "/" : `/${item.href}`}
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
  );
};

export default Sidebar;