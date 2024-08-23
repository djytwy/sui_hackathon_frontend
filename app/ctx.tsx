"use client";
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useState,
  PropsWithChildren,
  useEffect,
} from "react";

type dataProps = {
  activeTab: "Mint" | "Redeem";
  setActiveTab: Dispatch<SetStateAction<"Mint" | "Redeem">>;
};

const Ctx = createContext<dataProps>({
  activeTab: "Mint",
  setActiveTab: () => { },
});

const Provider = ({ children }: PropsWithChildren) => {
  const [activeTab, setActiveTab] = useState<"Mint" | "Redeem">("Mint");

  return (
    <Ctx.Provider
      value={{
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </Ctx.Provider>
  );
};

const useSignInContext = () => useContext(Ctx);

export { Provider as SignInProvider, useSignInContext };
