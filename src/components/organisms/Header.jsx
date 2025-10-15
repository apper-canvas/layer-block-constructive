import { useLocation } from "react-router-dom";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Header = ({ onMenuClick, onAddClick, className = "" }) => {
  const location = useLocation();
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Dashboard";
      case "/contacts":
        return "Contacts";
      case "/leads":
        return "Leads";
      default:
        return "CRM Pro";
    }
  };

  const showAddButton = location.pathname === "/contacts" || location.pathname === "/leads";

  return (
    <header className={cn(
      "bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm",
      className
    )}>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          icon="Menu"
          onClick={onMenuClick}
          className="lg:hidden h-8 w-8 p-0"
        />
        <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
      </div>

<div className="flex items-center gap-4">
        
        {showAddButton && (
          <Button
            onClick={onAddClick}
            icon="Plus"
            size="sm"
          >
            Add {location.pathname === "/contacts" ? "Contact" : "Lead"}
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;