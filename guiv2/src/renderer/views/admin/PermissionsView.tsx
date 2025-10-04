import React from 'react';
import { Shield, Check, X } from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { Checkbox } from '../../components/atoms/Checkbox';
import { Select } from '../../components/atoms/Select';

export const PermissionsView: React.FC = () => {
  const [selectedRole, setSelectedRole] = React.useState('PowerUser');
  
  const permissionCategories = [
    {
      name: 'Discovery',
      permissions: ['Read', 'Execute', 'Export', 'Schedule'],
    },
    {
      name: 'Migration',
      permissions: ['Read', 'Plan', 'Execute', 'Rollback'],
    },
    {
      name: 'Users',
      permissions: ['Read', 'Create', 'Update', 'Delete'],
    },
    {
      name: 'Reports',
      permissions: ['Read', 'Create', 'Schedule', 'Export'],
    },
  ];

  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Permissions Management</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Configure role-based access control permissions
        </p>
      </div>
      
      <div className="w-64">
        <Select label="Select Role" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
          <option value="Administrator">Administrator</option>
          <option value="PowerUser">Power User</option>
          <option value="User">User</option>
          <option value="ReadOnly">Read Only</option>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {permissionCategories.map((category) => (
          <div key={category.name} className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {category.name}
            </h3>
            <div className="space-y-2">
              {category.permissions.map((permission) => (
                <Checkbox
                  key={permission}
                  label={permission}
                  checked={selectedRole === 'Administrator' || Math.random() > 0.5}
                  onChange={() => {}}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="primary">Save Permissions</Button>
        <Button variant="secondary">Reset to Defaults</Button>
      </div>
    </div>
  );
};
