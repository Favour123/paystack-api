"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const security_1 = require("./middleware/security");
const books_1 = __importDefault(require("./routes/books"));
const payments_1 = __importDefault(require("./routes/payments"));
const downloads_1 = __importDefault(require("./routes/downloads"));
const webhooks_1 = __importDefault(require("./routes/webhooks"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
(0, database_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)(security_1.corsOptions));
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(security_1.requestLogger);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.set('trust proxy', 1);
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Happy Little Pages API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
app.use('/api/books', books_1.default);
app.use('/api/payments', payments_1.default);
app.use('/api/downloads', downloads_1.default);
app.use('/api/webhooks', webhooks_1.default);
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Happy Little Pages API',
        version: '1.0.0',
        endpoints: {
            books: '/api/books',
            payments: '/api/payments',
            downloads: '/api/downloads',
            webhooks: '/api/webhooks',
            health: '/health'
        }
    });
});
app.use(security_1.notFound);
app.use(security_1.errorHandler);
app.listen(PORT, () => {
    console.log(`🚀 Happy Little Pages API running on port ${PORT}`);
    console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});
exports.default = app;
//# sourceMappingURL=server.js.map