import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NAME_KEY = "wt_user_name";

type UserContextType = {
  name: string;
  setName: (name: string) => void;
};

const UserContext = createContext<UserContextType>({ name: "", setName: () => {} });

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [name, setNameState] = useState("");

  useEffect(() => {
    AsyncStorage.getItem(NAME_KEY).then((saved) => {
      if (saved) setNameState(saved);
    });
  }, []);

  const setName = (n: string) => {
    setNameState(n);
    AsyncStorage.setItem(NAME_KEY, n);
  };

  return (
    <UserContext.Provider value={{ name, setName }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
