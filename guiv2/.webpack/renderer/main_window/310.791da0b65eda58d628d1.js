"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[310],{

/***/ 10310:
/*!**************************************************************!*\
  !*** ./src/renderer/components/dialogs/CreateUserDialog.tsx ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CreateUserDialog: () => (/* binding */ CreateUserDialog)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ 74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! lucide-react */ 72832);
/* harmony import */ var _atoms_Button__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atoms/Button */ 74160);
/* harmony import */ var _atoms_Input__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../atoms/Input */ 34766);
/* harmony import */ var _store_useModalStore__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../store/useModalStore */ 23361);
/* harmony import */ var _store_useProfileStore__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../store/useProfileStore */ 33813);

/**
 * Create User Dialog
 *
 * Modal dialog for creating a new user in Active Directory or Azure AD
 */






const CreateUserDialog = ({ modalId, onUserCreated }) => {
    const { closeModal } = (0,_store_useModalStore__WEBPACK_IMPORTED_MODULE_5__.useModalStore)();
    const { selectedSourceProfile } = (0,_store_useProfileStore__WEBPACK_IMPORTED_MODULE_6__.useProfileStore)();
    const [formData, setFormData] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)({
        firstName: '',
        lastName: '',
        displayName: '',
        userPrincipalName: '',
        email: '',
        department: '',
        jobTitle: '',
        officeLocation: '',
        password: '',
        confirmPassword: '',
        accountEnabled: true,
        changePasswordAtNextLogon: true,
    });
    const [isSubmitting, setIsSubmitting] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
    const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Auto-generate displayName if firstName or lastName changes
        if (field === 'firstName' || field === 'lastName') {
            const firstName = field === 'firstName' ? value : formData.firstName;
            const lastName = field === 'lastName' ? value : formData.lastName;
            if (firstName && lastName) {
                setFormData(prev => ({ ...prev, displayName: `${firstName} ${lastName}` }));
            }
        }
        // Auto-generate UPN from email
        if (field === 'email') {
            setFormData(prev => ({ ...prev, userPrincipalName: value }));
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        // Validation
        if (!formData.firstName || !formData.lastName) {
            setError('First name and last name are required');
            return;
        }
        if (!formData.email || !formData.email.includes('@')) {
            setError('Valid email address is required');
            return;
        }
        if (!formData.password || formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (!selectedSourceProfile) {
            setError('No profile selected');
            return;
        }
        setIsSubmitting(true);
        try {
            // Call PowerShell module to create user
            const result = await window.electronAPI.executeModule({
                modulePath: 'Modules/Management/UserManagement.psm1',
                functionName: 'New-User',
                parameters: {
                    FirstName: formData.firstName,
                    LastName: formData.lastName,
                    DisplayName: formData.displayName,
                    UserPrincipalName: formData.userPrincipalName,
                    Email: formData.email,
                    Department: formData.department,
                    JobTitle: formData.jobTitle,
                    OfficeLocation: formData.officeLocation,
                    Password: formData.password,
                    AccountEnabled: formData.accountEnabled,
                    ChangePasswordAtNextLogon: formData.changePasswordAtNextLogon,
                    ProfileId: selectedSourceProfile.id,
                },
            });
            if (result.success) {
                console.log('[CreateUserDialog] User created successfully:', result.data);
                // Call callback if provided
                if (onUserCreated) {
                    onUserCreated(result.data);
                }
                // Close modal
                closeModal(modalId);
            }
            else {
                throw new Error(result.error || 'Failed to create user');
            }
        }
        catch (err) {
            console.error('[CreateUserDialog] Failed to create user:', err);
            setError(err instanceof Error ? err.message : 'Failed to create user');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Create New User" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { onClick: () => closeModal(modalId), className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", disabled: isSubmitting, children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.X, { size: 24 }) })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("form", { onSubmit: handleSubmit, className: "p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-180px)]", children: [error && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400", children: error })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_4__.Input, { label: "First Name *", value: formData.firstName, onChange: (e) => handleInputChange('firstName', e.target.value), placeholder: "John", required: true, disabled: isSubmitting }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_4__.Input, { label: "Last Name *", value: formData.lastName, onChange: (e) => handleInputChange('lastName', e.target.value), placeholder: "Doe", required: true, disabled: isSubmitting })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_4__.Input, { label: "Display Name", value: formData.displayName, onChange: (e) => handleInputChange('displayName', e.target.value), placeholder: "Auto-generated from first and last name", disabled: isSubmitting }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_4__.Input, { label: "Email / User Principal Name *", type: "email", value: formData.email, onChange: (e) => handleInputChange('email', e.target.value), placeholder: "john.doe@company.com", required: true, disabled: isSubmitting }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_4__.Input, { label: "Department", value: formData.department, onChange: (e) => handleInputChange('department', e.target.value), placeholder: "IT", disabled: isSubmitting }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_4__.Input, { label: "Job Title", value: formData.jobTitle, onChange: (e) => handleInputChange('jobTitle', e.target.value), placeholder: "Software Engineer", disabled: isSubmitting })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_4__.Input, { label: "Office Location", value: formData.officeLocation, onChange: (e) => handleInputChange('officeLocation', e.target.value), placeholder: "New York", disabled: isSubmitting }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_4__.Input, { label: "Password *", type: "password", value: formData.password, onChange: (e) => handleInputChange('password', e.target.value), placeholder: "Min 8 characters", required: true, disabled: isSubmitting }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_4__.Input, { label: "Confirm Password *", type: "password", value: formData.confirmPassword, onChange: (e) => handleInputChange('confirmPassword', e.target.value), placeholder: "Re-enter password", required: true, disabled: isSubmitting })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "space-y-2", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("label", { className: "flex items-center gap-2", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { type: "checkbox", checked: formData.accountEnabled, onChange: (e) => handleInputChange('accountEnabled', e.target.checked), disabled: isSubmitting, className: "rounded" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: "Account Enabled" })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("label", { className: "flex items-center gap-2", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { type: "checkbox", checked: formData.changePasswordAtNextLogon, onChange: (e) => handleInputChange('changePasswordAtNextLogon', e.target.checked), disabled: isSubmitting, className: "rounded" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: "User must change password at next logon" })] })] }), selectedSourceProfile && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("p", { className: "text-sm text-blue-700 dark:text-blue-400", children: ["User will be created in: ", (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("strong", { children: selectedSourceProfile.companyName })] }) }))] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_3__.Button, { variant: "secondary", onClick: () => closeModal(modalId), disabled: isSubmitting, children: "Cancel" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_3__.Button, { variant: "primary", onClick: handleSubmit, loading: isSubmitting, disabled: isSubmitting, children: "Create User" })] })] }) }));
};
/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = ((/* unused pure expression or super */ null && (CreateUserDialog)));


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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ci9jb21wb25lbnRzL2RpYWxvZ3MvQ3JlYXRlVXNlckRpYWxvZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogQ3JlYXRlIFVzZXIgRGlhbG9nXG4gKlxuICogTW9kYWwgZGlhbG9nIGZvciBjcmVhdGluZyBhIG5ldyB1c2VyIGluIEFjdGl2ZSBEaXJlY3Rvcnkgb3IgQXp1cmUgQURcbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgWCB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi9hdG9tcy9CdXR0b24nO1xuaW1wb3J0IHsgSW5wdXQgfSBmcm9tICcuLi9hdG9tcy9JbnB1dCc7XG5pbXBvcnQgeyB1c2VNb2RhbFN0b3JlIH0gZnJvbSAnLi4vLi4vc3RvcmUvdXNlTW9kYWxTdG9yZSc7XG5pbXBvcnQgeyB1c2VQcm9maWxlU3RvcmUgfSBmcm9tICcuLi8uLi9zdG9yZS91c2VQcm9maWxlU3RvcmUnO1xuZXhwb3J0IGNvbnN0IENyZWF0ZVVzZXJEaWFsb2cgPSAoeyBtb2RhbElkLCBvblVzZXJDcmVhdGVkIH0pID0+IHtcbiAgICBjb25zdCB7IGNsb3NlTW9kYWwgfSA9IHVzZU1vZGFsU3RvcmUoKTtcbiAgICBjb25zdCB7IHNlbGVjdGVkU291cmNlUHJvZmlsZSB9ID0gdXNlUHJvZmlsZVN0b3JlKCk7XG4gICAgY29uc3QgW2Zvcm1EYXRhLCBzZXRGb3JtRGF0YV0gPSB1c2VTdGF0ZSh7XG4gICAgICAgIGZpcnN0TmFtZTogJycsXG4gICAgICAgIGxhc3ROYW1lOiAnJyxcbiAgICAgICAgZGlzcGxheU5hbWU6ICcnLFxuICAgICAgICB1c2VyUHJpbmNpcGFsTmFtZTogJycsXG4gICAgICAgIGVtYWlsOiAnJyxcbiAgICAgICAgZGVwYXJ0bWVudDogJycsXG4gICAgICAgIGpvYlRpdGxlOiAnJyxcbiAgICAgICAgb2ZmaWNlTG9jYXRpb246ICcnLFxuICAgICAgICBwYXNzd29yZDogJycsXG4gICAgICAgIGNvbmZpcm1QYXNzd29yZDogJycsXG4gICAgICAgIGFjY291bnRFbmFibGVkOiB0cnVlLFxuICAgICAgICBjaGFuZ2VQYXNzd29yZEF0TmV4dExvZ29uOiB0cnVlLFxuICAgIH0pO1xuICAgIGNvbnN0IFtpc1N1Ym1pdHRpbmcsIHNldElzU3VibWl0dGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBoYW5kbGVJbnB1dENoYW5nZSA9IChmaWVsZCwgdmFsdWUpID0+IHtcbiAgICAgICAgc2V0Rm9ybURhdGEocHJldiA9PiAoeyAuLi5wcmV2LCBbZmllbGRdOiB2YWx1ZSB9KSk7XG4gICAgICAgIC8vIEF1dG8tZ2VuZXJhdGUgZGlzcGxheU5hbWUgaWYgZmlyc3ROYW1lIG9yIGxhc3ROYW1lIGNoYW5nZXNcbiAgICAgICAgaWYgKGZpZWxkID09PSAnZmlyc3ROYW1lJyB8fCBmaWVsZCA9PT0gJ2xhc3ROYW1lJykge1xuICAgICAgICAgICAgY29uc3QgZmlyc3ROYW1lID0gZmllbGQgPT09ICdmaXJzdE5hbWUnID8gdmFsdWUgOiBmb3JtRGF0YS5maXJzdE5hbWU7XG4gICAgICAgICAgICBjb25zdCBsYXN0TmFtZSA9IGZpZWxkID09PSAnbGFzdE5hbWUnID8gdmFsdWUgOiBmb3JtRGF0YS5sYXN0TmFtZTtcbiAgICAgICAgICAgIGlmIChmaXJzdE5hbWUgJiYgbGFzdE5hbWUpIHtcbiAgICAgICAgICAgICAgICBzZXRGb3JtRGF0YShwcmV2ID0+ICh7IC4uLnByZXYsIGRpc3BsYXlOYW1lOiBgJHtmaXJzdE5hbWV9ICR7bGFzdE5hbWV9YCB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gQXV0by1nZW5lcmF0ZSBVUE4gZnJvbSBlbWFpbFxuICAgICAgICBpZiAoZmllbGQgPT09ICdlbWFpbCcpIHtcbiAgICAgICAgICAgIHNldEZvcm1EYXRhKHByZXYgPT4gKHsgLi4ucHJldiwgdXNlclByaW5jaXBhbE5hbWU6IHZhbHVlIH0pKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgaGFuZGxlU3VibWl0ID0gYXN5bmMgKGUpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBzZXRFcnJvcihudWxsKTtcbiAgICAgICAgLy8gVmFsaWRhdGlvblxuICAgICAgICBpZiAoIWZvcm1EYXRhLmZpcnN0TmFtZSB8fCAhZm9ybURhdGEubGFzdE5hbWUpIHtcbiAgICAgICAgICAgIHNldEVycm9yKCdGaXJzdCBuYW1lIGFuZCBsYXN0IG5hbWUgYXJlIHJlcXVpcmVkJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFmb3JtRGF0YS5lbWFpbCB8fCAhZm9ybURhdGEuZW1haWwuaW5jbHVkZXMoJ0AnKSkge1xuICAgICAgICAgICAgc2V0RXJyb3IoJ1ZhbGlkIGVtYWlsIGFkZHJlc3MgaXMgcmVxdWlyZWQnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWZvcm1EYXRhLnBhc3N3b3JkIHx8IGZvcm1EYXRhLnBhc3N3b3JkLmxlbmd0aCA8IDgpIHtcbiAgICAgICAgICAgIHNldEVycm9yKCdQYXNzd29yZCBtdXN0IGJlIGF0IGxlYXN0IDggY2hhcmFjdGVycycpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmb3JtRGF0YS5wYXNzd29yZCAhPT0gZm9ybURhdGEuY29uZmlybVBhc3N3b3JkKSB7XG4gICAgICAgICAgICBzZXRFcnJvcignUGFzc3dvcmRzIGRvIG5vdCBtYXRjaCcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghc2VsZWN0ZWRTb3VyY2VQcm9maWxlKSB7XG4gICAgICAgICAgICBzZXRFcnJvcignTm8gcHJvZmlsZSBzZWxlY3RlZCcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNldElzU3VibWl0dGluZyh0cnVlKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIENhbGwgUG93ZXJTaGVsbCBtb2R1bGUgdG8gY3JlYXRlIHVzZXJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5leGVjdXRlTW9kdWxlKHtcbiAgICAgICAgICAgICAgICBtb2R1bGVQYXRoOiAnTW9kdWxlcy9NYW5hZ2VtZW50L1VzZXJNYW5hZ2VtZW50LnBzbTEnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uTmFtZTogJ05ldy1Vc2VyJyxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIEZpcnN0TmFtZTogZm9ybURhdGEuZmlyc3ROYW1lLFxuICAgICAgICAgICAgICAgICAgICBMYXN0TmFtZTogZm9ybURhdGEubGFzdE5hbWUsXG4gICAgICAgICAgICAgICAgICAgIERpc3BsYXlOYW1lOiBmb3JtRGF0YS5kaXNwbGF5TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgVXNlclByaW5jaXBhbE5hbWU6IGZvcm1EYXRhLnVzZXJQcmluY2lwYWxOYW1lLFxuICAgICAgICAgICAgICAgICAgICBFbWFpbDogZm9ybURhdGEuZW1haWwsXG4gICAgICAgICAgICAgICAgICAgIERlcGFydG1lbnQ6IGZvcm1EYXRhLmRlcGFydG1lbnQsXG4gICAgICAgICAgICAgICAgICAgIEpvYlRpdGxlOiBmb3JtRGF0YS5qb2JUaXRsZSxcbiAgICAgICAgICAgICAgICAgICAgT2ZmaWNlTG9jYXRpb246IGZvcm1EYXRhLm9mZmljZUxvY2F0aW9uLFxuICAgICAgICAgICAgICAgICAgICBQYXNzd29yZDogZm9ybURhdGEucGFzc3dvcmQsXG4gICAgICAgICAgICAgICAgICAgIEFjY291bnRFbmFibGVkOiBmb3JtRGF0YS5hY2NvdW50RW5hYmxlZCxcbiAgICAgICAgICAgICAgICAgICAgQ2hhbmdlUGFzc3dvcmRBdE5leHRMb2dvbjogZm9ybURhdGEuY2hhbmdlUGFzc3dvcmRBdE5leHRMb2dvbixcbiAgICAgICAgICAgICAgICAgICAgUHJvZmlsZUlkOiBzZWxlY3RlZFNvdXJjZVByb2ZpbGUuaWQsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tDcmVhdGVVc2VyRGlhbG9nXSBVc2VyIGNyZWF0ZWQgc3VjY2Vzc2Z1bGx5OicsIHJlc3VsdC5kYXRhKTtcbiAgICAgICAgICAgICAgICAvLyBDYWxsIGNhbGxiYWNrIGlmIHByb3ZpZGVkXG4gICAgICAgICAgICAgICAgaWYgKG9uVXNlckNyZWF0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgb25Vc2VyQ3JlYXRlZChyZXN1bHQuZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIENsb3NlIG1vZGFsXG4gICAgICAgICAgICAgICAgY2xvc2VNb2RhbChtb2RhbElkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihyZXN1bHQuZXJyb3IgfHwgJ0ZhaWxlZCB0byBjcmVhdGUgdXNlcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tDcmVhdGVVc2VyRGlhbG9nXSBGYWlsZWQgdG8gY3JlYXRlIHVzZXI6JywgZXJyKTtcbiAgICAgICAgICAgIHNldEVycm9yKGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiAnRmFpbGVkIHRvIGNyZWF0ZSB1c2VyJyk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRJc1N1Ym1pdHRpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZml4ZWQgaW5zZXQtMCB6LTUwIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGJnLWJsYWNrLzUwXCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQtbGcgc2hhZG93LXhsIHctZnVsbCBtYXgtdy0yeGwgbWF4LWgtWzkwdmhdIG92ZXJmbG93LWhpZGRlblwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBwLTYgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeChcImgyXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZVwiLCBjaGlsZHJlbjogXCJDcmVhdGUgTmV3IFVzZXJcIiB9KSwgX2pzeChcImJ1dHRvblwiLCB7IG9uQ2xpY2s6ICgpID0+IGNsb3NlTW9kYWwobW9kYWxJZCksIGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNDAwIGhvdmVyOnRleHQtZ3JheS02MDAgZGFyazpob3Zlcjp0ZXh0LWdyYXktMzAwXCIsIGRpc2FibGVkOiBpc1N1Ym1pdHRpbmcsIGNoaWxkcmVuOiBfanN4KFgsIHsgc2l6ZTogMjQgfSkgfSldIH0pLCBfanN4cyhcImZvcm1cIiwgeyBvblN1Ym1pdDogaGFuZGxlU3VibWl0LCBjbGFzc05hbWU6IFwicC02IHNwYWNlLXktNCBvdmVyZmxvdy15LWF1dG8gbWF4LWgtW2NhbGMoOTB2aC0xODBweCldXCIsIGNoaWxkcmVuOiBbZXJyb3IgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicC00IGJnLXJlZC01MCBkYXJrOmJnLXJlZC05MDAvMjAgYm9yZGVyIGJvcmRlci1yZWQtMjAwIGRhcms6Ym9yZGVyLXJlZC04MDAgcm91bmRlZC1sZyB0ZXh0LXJlZC03MDAgZGFyazp0ZXh0LXJlZC00MDBcIiwgY2hpbGRyZW46IGVycm9yIH0pKSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMiBnYXAtNFwiLCBjaGlsZHJlbjogW19qc3goSW5wdXQsIHsgbGFiZWw6IFwiRmlyc3QgTmFtZSAqXCIsIHZhbHVlOiBmb3JtRGF0YS5maXJzdE5hbWUsIG9uQ2hhbmdlOiAoZSkgPT4gaGFuZGxlSW5wdXRDaGFuZ2UoJ2ZpcnN0TmFtZScsIGUudGFyZ2V0LnZhbHVlKSwgcGxhY2Vob2xkZXI6IFwiSm9oblwiLCByZXF1aXJlZDogdHJ1ZSwgZGlzYWJsZWQ6IGlzU3VibWl0dGluZyB9KSwgX2pzeChJbnB1dCwgeyBsYWJlbDogXCJMYXN0IE5hbWUgKlwiLCB2YWx1ZTogZm9ybURhdGEubGFzdE5hbWUsIG9uQ2hhbmdlOiAoZSkgPT4gaGFuZGxlSW5wdXRDaGFuZ2UoJ2xhc3ROYW1lJywgZS50YXJnZXQudmFsdWUpLCBwbGFjZWhvbGRlcjogXCJEb2VcIiwgcmVxdWlyZWQ6IHRydWUsIGRpc2FibGVkOiBpc1N1Ym1pdHRpbmcgfSldIH0pLCBfanN4KElucHV0LCB7IGxhYmVsOiBcIkRpc3BsYXkgTmFtZVwiLCB2YWx1ZTogZm9ybURhdGEuZGlzcGxheU5hbWUsIG9uQ2hhbmdlOiAoZSkgPT4gaGFuZGxlSW5wdXRDaGFuZ2UoJ2Rpc3BsYXlOYW1lJywgZS50YXJnZXQudmFsdWUpLCBwbGFjZWhvbGRlcjogXCJBdXRvLWdlbmVyYXRlZCBmcm9tIGZpcnN0IGFuZCBsYXN0IG5hbWVcIiwgZGlzYWJsZWQ6IGlzU3VibWl0dGluZyB9KSwgX2pzeChJbnB1dCwgeyBsYWJlbDogXCJFbWFpbCAvIFVzZXIgUHJpbmNpcGFsIE5hbWUgKlwiLCB0eXBlOiBcImVtYWlsXCIsIHZhbHVlOiBmb3JtRGF0YS5lbWFpbCwgb25DaGFuZ2U6IChlKSA9PiBoYW5kbGVJbnB1dENoYW5nZSgnZW1haWwnLCBlLnRhcmdldC52YWx1ZSksIHBsYWNlaG9sZGVyOiBcImpvaG4uZG9lQGNvbXBhbnkuY29tXCIsIHJlcXVpcmVkOiB0cnVlLCBkaXNhYmxlZDogaXNTdWJtaXR0aW5nIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJncmlkIGdyaWQtY29scy0yIGdhcC00XCIsIGNoaWxkcmVuOiBbX2pzeChJbnB1dCwgeyBsYWJlbDogXCJEZXBhcnRtZW50XCIsIHZhbHVlOiBmb3JtRGF0YS5kZXBhcnRtZW50LCBvbkNoYW5nZTogKGUpID0+IGhhbmRsZUlucHV0Q2hhbmdlKCdkZXBhcnRtZW50JywgZS50YXJnZXQudmFsdWUpLCBwbGFjZWhvbGRlcjogXCJJVFwiLCBkaXNhYmxlZDogaXNTdWJtaXR0aW5nIH0pLCBfanN4KElucHV0LCB7IGxhYmVsOiBcIkpvYiBUaXRsZVwiLCB2YWx1ZTogZm9ybURhdGEuam9iVGl0bGUsIG9uQ2hhbmdlOiAoZSkgPT4gaGFuZGxlSW5wdXRDaGFuZ2UoJ2pvYlRpdGxlJywgZS50YXJnZXQudmFsdWUpLCBwbGFjZWhvbGRlcjogXCJTb2Z0d2FyZSBFbmdpbmVlclwiLCBkaXNhYmxlZDogaXNTdWJtaXR0aW5nIH0pXSB9KSwgX2pzeChJbnB1dCwgeyBsYWJlbDogXCJPZmZpY2UgTG9jYXRpb25cIiwgdmFsdWU6IGZvcm1EYXRhLm9mZmljZUxvY2F0aW9uLCBvbkNoYW5nZTogKGUpID0+IGhhbmRsZUlucHV0Q2hhbmdlKCdvZmZpY2VMb2NhdGlvbicsIGUudGFyZ2V0LnZhbHVlKSwgcGxhY2Vob2xkZXI6IFwiTmV3IFlvcmtcIiwgZGlzYWJsZWQ6IGlzU3VibWl0dGluZyB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMiBnYXAtNFwiLCBjaGlsZHJlbjogW19qc3goSW5wdXQsIHsgbGFiZWw6IFwiUGFzc3dvcmQgKlwiLCB0eXBlOiBcInBhc3N3b3JkXCIsIHZhbHVlOiBmb3JtRGF0YS5wYXNzd29yZCwgb25DaGFuZ2U6IChlKSA9PiBoYW5kbGVJbnB1dENoYW5nZSgncGFzc3dvcmQnLCBlLnRhcmdldC52YWx1ZSksIHBsYWNlaG9sZGVyOiBcIk1pbiA4IGNoYXJhY3RlcnNcIiwgcmVxdWlyZWQ6IHRydWUsIGRpc2FibGVkOiBpc1N1Ym1pdHRpbmcgfSksIF9qc3goSW5wdXQsIHsgbGFiZWw6IFwiQ29uZmlybSBQYXNzd29yZCAqXCIsIHR5cGU6IFwicGFzc3dvcmRcIiwgdmFsdWU6IGZvcm1EYXRhLmNvbmZpcm1QYXNzd29yZCwgb25DaGFuZ2U6IChlKSA9PiBoYW5kbGVJbnB1dENoYW5nZSgnY29uZmlybVBhc3N3b3JkJywgZS50YXJnZXQudmFsdWUpLCBwbGFjZWhvbGRlcjogXCJSZS1lbnRlciBwYXNzd29yZFwiLCByZXF1aXJlZDogdHJ1ZSwgZGlzYWJsZWQ6IGlzU3VibWl0dGluZyB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNwYWNlLXktMlwiLCBjaGlsZHJlbjogW19qc3hzKFwibGFiZWxcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KFwiaW5wdXRcIiwgeyB0eXBlOiBcImNoZWNrYm94XCIsIGNoZWNrZWQ6IGZvcm1EYXRhLmFjY291bnRFbmFibGVkLCBvbkNoYW5nZTogKGUpID0+IGhhbmRsZUlucHV0Q2hhbmdlKCdhY2NvdW50RW5hYmxlZCcsIGUudGFyZ2V0LmNoZWNrZWQpLCBkaXNhYmxlZDogaXNTdWJtaXR0aW5nLCBjbGFzc05hbWU6IFwicm91bmRlZFwiIH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS03MDAgZGFyazp0ZXh0LWdyYXktMzAwXCIsIGNoaWxkcmVuOiBcIkFjY291bnQgRW5hYmxlZFwiIH0pXSB9KSwgX2pzeHMoXCJsYWJlbFwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiwgY2hlY2tlZDogZm9ybURhdGEuY2hhbmdlUGFzc3dvcmRBdE5leHRMb2dvbiwgb25DaGFuZ2U6IChlKSA9PiBoYW5kbGVJbnB1dENoYW5nZSgnY2hhbmdlUGFzc3dvcmRBdE5leHRMb2dvbicsIGUudGFyZ2V0LmNoZWNrZWQpLCBkaXNhYmxlZDogaXNTdWJtaXR0aW5nLCBjbGFzc05hbWU6IFwicm91bmRlZFwiIH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS03MDAgZGFyazp0ZXh0LWdyYXktMzAwXCIsIGNoaWxkcmVuOiBcIlVzZXIgbXVzdCBjaGFuZ2UgcGFzc3dvcmQgYXQgbmV4dCBsb2dvblwiIH0pXSB9KV0gfSksIHNlbGVjdGVkU291cmNlUHJvZmlsZSAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJwLTMgYmctYmx1ZS01MCBkYXJrOmJnLWJsdWUtOTAwLzIwIGJvcmRlciBib3JkZXItYmx1ZS0yMDAgZGFyazpib3JkZXItYmx1ZS04MDAgcm91bmRlZC1sZ1wiLCBjaGlsZHJlbjogX2pzeHMoXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ibHVlLTcwMCBkYXJrOnRleHQtYmx1ZS00MDBcIiwgY2hpbGRyZW46IFtcIlVzZXIgd2lsbCBiZSBjcmVhdGVkIGluOiBcIiwgX2pzeChcInN0cm9uZ1wiLCB7IGNoaWxkcmVuOiBzZWxlY3RlZFNvdXJjZVByb2ZpbGUuY29tcGFueU5hbWUgfSldIH0pIH0pKV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktZW5kIGdhcC0zIHAtNiBib3JkZXItdCBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBvbkNsaWNrOiAoKSA9PiBjbG9zZU1vZGFsKG1vZGFsSWQpLCBkaXNhYmxlZDogaXNTdWJtaXR0aW5nLCBjaGlsZHJlbjogXCJDYW5jZWxcIiB9KSwgX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJwcmltYXJ5XCIsIG9uQ2xpY2s6IGhhbmRsZVN1Ym1pdCwgbG9hZGluZzogaXNTdWJtaXR0aW5nLCBkaXNhYmxlZDogaXNTdWJtaXR0aW5nLCBjaGlsZHJlbjogXCJDcmVhdGUgVXNlclwiIH0pXSB9KV0gfSkgfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IENyZWF0ZVVzZXJEaWFsb2c7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=