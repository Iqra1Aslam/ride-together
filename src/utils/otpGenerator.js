import { generate } from "otp-generator";

export const otpCodeGenerator = generate(4, { digits: true, lowerCaseAlphabets: false, specialChars: false, upperCaseAlphabets: false })