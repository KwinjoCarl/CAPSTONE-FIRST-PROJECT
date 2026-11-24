import IconifyIcon from '@/components/wrapper/IconifyIcon';
import { useLayoutContext } from '@/context/useLayoutContext';
import useViewPort from '@/hooks/useViewPort';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
const LeftSideBarToggle = () => {
  const {
    menu: {
      size
    },
    changeMenu: {
      size: changeMenuSize
    }
  } = useLayoutContext();
  const {
    pathname
  } = useLocation();
  const {
    width
  } = useViewPort();
  const handleMenuSize = () => {
    // Persistent sidebar: toggle between full menu and icon rail — never hidden
    if (size === 'condensed') changeMenuSize('default');else changeMenuSize('condensed');
  };
  useEffect(() => {
    // Migrate any persisted 'hidden' state to a visible mode
    if (size === 'hidden') {
      changeMenuSize(width <= 1140 ? 'condensed' : 'default');
    }
    // Small screens default to the icon rail so content stays usable
    if (width <= 1140 && size === 'default') {
      changeMenuSize('condensed');
    }
  }, [pathname, width, size]);
  return <div className="topbar-item">
      <button type="button" onClick={handleMenuSize} className="button-toggle-menu topbar-button" title={size === 'condensed' ? 'Expand menu' : 'Collapse menu'}>
        <IconifyIcon icon="solar:hamburger-menu-outline" width={24} height={24} className="fs-24  align-middle" />
      </button>
    </div>;
};
export default LeftSideBarToggle;
