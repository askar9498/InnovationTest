import { FC } from "react";
import { useAuth } from "../modules/auth/core/Auth";
import CompleteUserInfo from "./CompleteUserInfo";
import CompleteLegalUserInfo from "./CompleteLegalUserInfo";

const CompleteUserInfoWrapper: FC = () => {
  const { currentUser } = useAuth();

  // Check if user is a legal entity (حقوقی) or individual (حقیقی)
  // userType: 1 for legal entity (حقوقی), 0 for individual (حقیقی)
  const isLegalEntity = currentUser?.userType === 1;

  return isLegalEntity ? <CompleteLegalUserInfo /> : <CompleteUserInfo />;
};

export default CompleteUserInfoWrapper; 