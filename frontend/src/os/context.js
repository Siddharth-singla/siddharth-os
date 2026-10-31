import { createContext, useContext } from "react";

const OSContext = createContext(null);

export const useOS = () => useContext(OSContext);

export default OSContext;
