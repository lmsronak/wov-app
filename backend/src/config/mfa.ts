import UserModel from "../models/userModel";
import User from "../models/userModel/User";
import speakeasy from "speakeasy";
import qrcode from "qrcode";

export const setupMfa = async (user: User) => {
  const secret = speakeasy.generateSecret({
    name: `MyApp (${user.email})`,
  });

  const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url || "");

  await UserModel.findByIdAndUpdate(user._id, { tempSecret: secret.base32 });

  return qrCodeDataUrl;
};
