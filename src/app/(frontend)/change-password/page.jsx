import Contain from '@/components/common/Contain';
import ChangePassword from '@/components/frontend/auth/changePassword/ChangePassword';

const ChangePasswordPage = () => {
    return (
        <Contain>
      <div className="mt-8">
        <ChangePassword /> 
      </div>
    </Contain>
    );
};

export default ChangePasswordPage;