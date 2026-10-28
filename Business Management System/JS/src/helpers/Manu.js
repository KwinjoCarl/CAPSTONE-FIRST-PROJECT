import { MENU_ITEMS } from '@/assets/data/menu-items';
import { MENU_PERMISSIONS } from '@/helpers/permissions';

export const getMenuItems = (hasPermission = null) => {
  if (typeof hasPermission !== 'function') {
    return MENU_ITEMS;
  }

  const filterItems = (items) => {
    return items
      .map(item => {
        if (item.isTitle) return item;

        if (item.children) {
          const filteredChildren = filterItems(item.children);
          // Hide parent if no children remain
          if (filteredChildren.length === 0) return null;
          return { ...item, children: filteredChildren };
        }

        const required = MENU_PERMISSIONS[item.key];
        if (required && !hasPermission(required)) return null;
        return item;
      })
      .filter(Boolean);
  };

  return filterItems(MENU_ITEMS);
};
export const findAllParent = (menuItems, menuItem) => {
  let parents = [];
  const parent = findMenuItem(menuItems, menuItem.parentKey);
  if (parent) {
    parents.push(parent.key);
    if (parent.parentKey) {
      parents = [...parents, ...findAllParent(menuItems, parent)];
    }
  }
  return parents;
};
export const getMenuItemFromURL = (items, url) => {
  if (items instanceof Array) {
    for (const item of items) {
      const foundItem = getMenuItemFromURL(item, url);
      if (foundItem) {
        return foundItem;
      }
    }
  } else {
    if (items.url == url) return items;
    if (items.children != null) {
      for (const item of items.children) {
        if (item.url == url) return item;
      }
    }
  }
};
export const findMenuItem = (menuItems, menuItemKey) => {
  if (menuItems && menuItemKey) {
    for (const item of menuItems) {
      if (item.key === menuItemKey) {
        return item;
      }
      const found = findMenuItem(item.children, menuItemKey);
      if (found) return found;
    }
  }
  return null;
};