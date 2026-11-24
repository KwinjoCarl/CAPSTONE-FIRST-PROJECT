import { Link } from 'react-router-dom';
const LogoBox = () => {
  return <div className="logo-box">
      <Link to="/dashboards" className="logo-dark">
        <h3 className="mb-0" style={{ fontWeight: 'bold', color: '#0d6efd' }}>BMS!</h3>
      </Link>
      <Link to="/dashboards" className="logo-light">
        <h3 className="mb-0" style={{ fontWeight: 'bold', color: '#ffffff' }}>BMS!</h3>
      </Link>
    </div>;
};
export default LogoBox;