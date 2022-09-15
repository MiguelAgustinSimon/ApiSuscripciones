const { Router } = require("express");
const verificarToken=require('../middlewares/VerificarToken');

const router = Router();
const {
    getProducts,
    getSubscriberSuscriptionCommProduct,
    getBySuscriptionProductIdCommProduct,
    getProductCommProduct,
    getAllProductsCommProduct,
    addSubscriptionCommProduct,
    createProductCommProduct,
    createProductScopeCommProduct,
    disableSubscriptionCommProduct,
    updateProductCommProduct,
    updateProductScopeCommProduct
 
}=require("../controllers/SuscripcionController");


//Aca genero las rutas que llamo del controller

//Rutas GET
router.get("/getProducts",verificarToken, getProducts);
router.get("/getSubscriberSuscriptionCommProduct/:subscriber_id?",verificarToken, getSubscriberSuscriptionCommProduct);
router.get("/getBySuscriptionProductIdCommProduct/:product_id?",verificarToken, getBySuscriptionProductIdCommProduct);
router.get("/getProductCommProduct/:product_code?",verificarToken, getProductCommProduct);
router.get("/getAllProductsCommProduct",verificarToken, getAllProductsCommProduct);

//Rutas POST
router.post("/addSubscriptionCommProduct",verificarToken, addSubscriptionCommProduct);
router.post("/createProductCommProduct",verificarToken, createProductCommProduct);
router.post("/createProductScopeCommProduct",verificarToken, createProductScopeCommProduct);

//Rutas PUT
router.put("/disableSubscriptionCommProduct/:subscriber_id?/:product_id?",verificarToken, disableSubscriptionCommProduct);
router.put("/updateProductCommProduct/:product?",verificarToken, updateProductCommProduct);
router.put("/updateProductScopeCommProduct/:product_scope_id?",verificarToken, updateProductScopeCommProduct);

module.exports = router;