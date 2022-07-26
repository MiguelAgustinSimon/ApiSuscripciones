const { Router } = require("express");
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
router.get("/getProducts", getProducts);
router.get("/getSubscriberSuscriptionCommProduct/:subscriber_id", getSubscriberSuscriptionCommProduct);
router.get("/getBySuscriptionProductIdCommProduct/:product_id", getBySuscriptionProductIdCommProduct);
router.get("/getProductCommProduct/:product_id", getProductCommProduct);
router.get("/getAllProductsCommProduct", getAllProductsCommProduct);

//Rutas POST
router.post("/addSubscriptionCommProduct", addSubscriptionCommProduct);
router.post("/createProductCommProduct", createProductCommProduct);
router.post("/createProductScopeCommProduct", createProductScopeCommProduct);

//Rutas PUT
router.put("/disableSubscriptionCommProduct/:subscriber_id/:product_id", disableSubscriptionCommProduct);
router.put("/updateProductCommProduct/:product_id", updateProductCommProduct);
router.put("/updateProductScopeCommProduct/:product_scope_id", updateProductScopeCommProduct);

module.exports = router;