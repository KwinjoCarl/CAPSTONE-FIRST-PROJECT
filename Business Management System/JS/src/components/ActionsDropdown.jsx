import { useId } from 'react';
import { Dropdown } from 'react-bootstrap';

const ActionsDropdown = ({ onEdit, onDelete }) => {
  const toggleId = useId();

  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="primary" size="sm" id={toggleId}>
        Actions
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {onEdit && (
          <Dropdown.Item onClick={onEdit}>
            <i className="mdi mdi-pencil me-2"></i> Edit/View
          </Dropdown.Item>
        )}
        {onDelete && (
          <Dropdown.Item onClick={onDelete} className="text-danger">
            <i className="mdi mdi-delete me-2"></i> Delete
          </Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ActionsDropdown;
