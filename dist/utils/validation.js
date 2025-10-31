"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePhone = exports.validateEmail = exports.validateDownload = exports.validatePaymentVerify = exports.validatePaymentInitialize = exports.validateBook = void 0;
const joi_1 = __importDefault(require("joi"));
const validate = (schema, target = 'body') => {
    return (req, res, next) => {
        const data = req[target];
        const { error, value } = schema.validate(data, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.details.map((d) => ({
                    message: d.message,
                    path: d.path.join('.'),
                    type: d.type
                }))
            });
            return;
        }
        req[target] = value;
        return next();
    };
};
const bookSchema = joi_1.default.object({
    title: joi_1.default.string().trim().min(2).max(100).required(),
    description: joi_1.default.string().trim().min(10).max(500).required(),
    price: joi_1.default.number().min(0).required(),
    ages: joi_1.default.string().trim().pattern(/^\d+-\d+$/).required(),
    rating: joi_1.default.number().integer().min(1).max(5).optional(),
    imageUrl: joi_1.default.string().uri().optional(),
    pdfUrl: joi_1.default.string().uri().optional(),
    isActive: joi_1.default.boolean().optional()
});
const paymentInitializeSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    amount: joi_1.default.number().min(1).required(),
    bookId: joi_1.default.string().regex(/^[a-f\d]{24}$/i).required(),
    customerName: joi_1.default.string().trim().min(2).max(100).required()
});
const paymentVerifySchema = joi_1.default.object({
    reference: joi_1.default.string().trim().required()
});
const downloadSchema = joi_1.default.object({
    token: joi_1.default.string().trim().min(32).max(64).required()
});
exports.validateBook = validate(bookSchema);
exports.validatePaymentInitialize = validate(paymentInitializeSchema);
exports.validatePaymentVerify = validate(paymentVerifySchema);
exports.validateDownload = validate(downloadSchema);
const validateEmail = (email) => joi_1.default.string().email().validate(email).error == null;
exports.validateEmail = validateEmail;
const validatePhone = (phone) => /^[\+]?[1-9][\d]{0,15}$/.test(phone);
exports.validatePhone = validatePhone;
//# sourceMappingURL=validation.js.map