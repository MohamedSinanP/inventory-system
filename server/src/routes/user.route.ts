import express from "express";
import productController from "../controllers/product.controller";
import { authenticate } from "../middlewares/auth.middleware";
import saleController from "../controllers/sale.controller";
import customerController from "../controllers/customer.controller";
import reportExportController from "../controllers/report.export.controller";

const router = express.Router();

router.post('/product', authenticate(), productController.addProduct.bind(productController));
router.put('/product/:id', authenticate(), productController.editProduct.bind(productController));
router.delete('/product/:id', authenticate(), productController.deleteProduct.bind(productController));
router.get('/product', authenticate(), productController.getProducts.bind(productController));
router.get('/all-product', authenticate(), productController.getAllProducts.bind(productController));
router.get('/products-report', authenticate(), productController.getItemsReport.bind(productController));

router.get('/sale', authenticate(), saleController.getSales.bind(saleController));
router.post('/sale', authenticate(), saleController.addSale.bind(saleController));
router.put('/sale/:id', authenticate(), saleController.editSale.bind(saleController));
router.delete('/sale/:id', authenticate(), saleController.deleteSale.bind(saleController));
router.get('/sales-report', authenticate(), saleController.getSalesReport.bind(saleController));
router.get('/customer-ledger', authenticate(), saleController.getCustomerLedger.bind(saleController));

router.post('/customer', authenticate(), customerController.addCustomer.bind(customerController));
router.put('/customer/:id', authenticate(), customerController.editCustomer.bind(customerController));
router.get('/customer', authenticate(), customerController.getCustomers.bind(customerController));
router.get('/all-customer', authenticate(), customerController.getAllCustomers.bind(customerController));

// data export
router.get('/export', authenticate(), reportExportController.exportReport.bind(reportExportController));



export default router;