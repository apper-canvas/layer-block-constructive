import { Link } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <div className="bg-primary/10 rounded-full p-8 mx-auto w-32 h-32 flex items-center justify-center mb-6">
            <ApperIcon name="AlertCircle" size={64} className="text-primary" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button as={Link} to="/" icon="Home">
            Go to Dashboard
          </Button>
          <Button variant="secondary" as={Link} to="/contacts" icon="Users">
            View Contacts
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;