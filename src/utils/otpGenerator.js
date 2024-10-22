import { generate } from "otp-generator";
// otp-generator' is simple one time password generator 
export const otpCodeGenerator = generate(4, { digits: true, lowerCaseAlphabets: false, 
    specialChars: false, upperCaseAlphabets: false })