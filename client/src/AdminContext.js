import { createContext, useContext } from 'react';

const AdminContext = createContext(false);

export const useAdmin = () => useContext(AdminContext);
export default AdminContext;
