const modeloProducto = require("../models/Product.js");
const modeloProductoSuscripcion = require("../models/Product_Subscription");
const modeloSubscriber = require("../models/Subscriber");
const modeloProductScope = require("../models/Product_Scope");
const modeloProductType = require("../models/Product_Type");
const { Sequelize} = require("sequelize");
const {logger}=require("../models/Logger");
const UUIDChecker = require("../middlewares/UUIDChecker");
const NullChecker = require("../middlewares/NullChecker");

const Op = Sequelize.Op;
// ---------------------------------------------------- RUTAS GET--------------------------------------------------------------


// const getProducts = async (req, res) => {
//     //const { subscriber_id }=req.params.subscriber_id;
    
//     await modeloProducto.findAll({
//         include:[{model:modeloProductoSuscripcion}]
//     })
//     .then( (data)=>{
//         res.json({datos:data});
//     })
//    .catch( (error)=>{
//         res.json({error:error});
//     })
// }

//Traigo todos los productos
const getProducts = async (req, res) => {
    const pageAsNumber=Number.parseInt(req.query.page);
    const sizeAsNumber=Number.parseInt(req.query.size);
   
    let page=0;
    let size=10;
    if(!Number.isNaN(pageAsNumber)&& pageAsNumber>0){
        page=pageAsNumber;
    }

    if(!Number.isNaN(sizeAsNumber) && sizeAsNumber>0 && sizeAsNumber<10){
        size=sizeAsNumber;
    }
    
    const { count } = await modeloProducto.findAndCountAll({
        limit:size,
        offset:page*size
    });
    res.header('X-Total-Count', count);
    const lista = await modeloProducto.findAll({
        limit:size,
        offset:page*size
        
        //include:[{model:modeloProductoSuscripcion}]
    })
    .then((lista)=>{
        logger.info(`getProducts ok`);
        res.status(200).json(lista);
    })
   .catch( (error)=>{
        logger.error(`getProducts error: ${error.message}`);
        res.json({error:error});
    })
}


//Todas las suscripciones por Suscriptor
const getSubscriberSuscriptionCommProduct= async (req, res) => {
    const {subscriber_id}= req.params;

    let where={};
    let subscription_start_date= req.query.subscription_start_date;
    let subscription_finish_date= req.query.subscription_finish_date;
    let is_active= req.query.is_active;
    let product_id= req.query.product_id;
 
    if(!UUIDChecker(subscriber_id)){
        logger.warn(`getSubscriberSuscriptionCommProduct: Ingrese un UUID valido: ${subscriber_id}`);
        return res.status(400).json({message: 'Ingrese un UUID valido'});
    }

    if(subscriber_id){
        where.subscriber_id= {
            [Op.eq]: subscriber_id
        }
    }
    if(subscription_start_date)
    {
        console.log(subscription_start_date);
        where.subscription_start_date= {
            [Op.gte]: subscription_start_date
        }
    }
    if(subscription_finish_date)
    {
        where.subscription_finish_date= {
            [Op.lte]: subscription_finish_date
        }
    }
    if(is_active){
        where.is_active= {
            [Op.eq]: is_active
        }
    }
    if(product_id){
        where.product_id= {
            [Op.eq]: product_id
        }
    }

   await modeloProductoSuscripcion.findAll({ 
       include:[{model:modeloProducto}],
       where
   })
   .then( (data)=>{
       if(data){
            logger.info(`getSubscriberSuscriptionCommProduct ok`);
            return res.json(data);
       }
       else{
            logger.warn(`getSubscriberSuscriptionCommProduct: Datos no encontrados`);
           return res.status(404).json({message: "Datos no encontrados."})
       }
   })
  .catch( (error)=>{
        logger.error(`getSubscriberSuscriptionCommProduct error: ${error.message}`);
       res.json({error:error.message});
   });
}


//Todas las suscripciones por Producto
const getBySuscriptionProductIdCommProduct= async (req, res) => {
    const {product_id}= req.params;
    let is_active= req.query.is_active;
    let where={};

    if(!UUIDChecker(product_id)){
        logger.warn(`getBySuscriptionProductIdCommProduct: Ingrese un UUID valido: ${product_id}`);
        return res.status(400).json({message: 'Ingrese un UUID valido'});
    }

    if(is_active){
        where.is_active= {
            [Op.eq]: is_active
        }
    }
    if(product_id){
        where.product_id= {
            [Op.eq]: product_id
        }
    }

   await modeloProducto.findAll({ 
       include:[{model:modeloProductoSuscripcion},{model:modeloProductScope}],
       where
   })
   .then( (data)=>{
       if(data){
            logger.info(`getBySuscriptionProductIdCommProduct ok`);
            return res.json(data);
       }
       else{
            logger.warn(`getBySuscriptionProductIdCommProduct: Datos no encontrados`);
            return res.status(404).json({message: "Datos no encontrados."})
       }
   })
  .catch( (error)=>{
        logger.error(`getBySuscriptionProductIdCommProduct error: ${error.message}`);
        res.json({error:error.message});
   });
}


//Traer producto especifico
const getProductCommProduct= async (req, res) => {
    const {product_id}= req.params;

    if(!UUIDChecker(product_id)){
        logger.warn(`getProductCommProduct: Ingrese un UUID valido: ${product_id}`);
        return res.status(400).json({message: 'Ingrese un UUID valido'});
    }

   await modeloProducto.findOne({ 
       where:{product_id}
   })
   .then( (data)=>{
       if(data){
            logger.info(`getProductCommProduct ok`);
            return res.json(data);
       }
       else{
            logger.warn(`getProductCommProduct: Datos no encontrados`);
            return res.status(404).json({message: "Datos no encontrados."})
       }
   })
  .catch( (error)=>{
        logger.error(`getProductCommProduct error: ${error.message}`);
        res.json({error:error.message});
   });
}

//Lista de Productos por tipo 
const getAllProductsCommProduct= async (req, res) => {
    let where={};

    let product_type_id= req.query.product_type_id;
    let apply_eol= req.query.apply_eol;
    let apply_ius= req.query.apply_ius;

    if(product_type_id){
        where.product_type_id= {
            [Op.eq]: product_type_id
        }
    }
    if(apply_eol){
        where.apply_eol= {
            [Op.eq]: apply_eol
        }
    }
    if(apply_ius){
        where.apply_ius= {
            [Op.eq]: apply_ius
        }
    }

   await modeloProducto.findAll({ 
       include:[{model:modeloProductScope}],
       where
   })
   .then( (data)=>{
       if(data){
            logger.info(`getSubscriberSuscriptionCommProduct ok`);
            return res.json(data);
       }
       else{
            logger.warn(`getAllProductsCommProduct: Datos no encontrados`);
            return res.status(404).json({message: "Datos no encontrados."})
       }
   })
  .catch( (error)=>{
        logger.error(`getAllProductsCommProduct error: ${error.message}`);
        res.json({error:error.message});
   });
}


// ---------------------------------------------------- RUTAS POST--------------------------------------------------------------
//Alta de Producto-Suscripcion
const addSubscriptionCommProduct = async (req, res) => { 
    let fechaHoy= new Date().toISOString().slice(0, 10);    
    const request = { 
        subscriber_id,
        product_id,     
        subscription_finish_date,
        account_executive_ref_id,
        creation_user
      } = req.body;
      
      const createProductSubscription = await modeloProductoSuscripcion.create({
        subscriber_id:subscriber_id,
        product_id:product_id,   
        subscription_start_date:fechaHoy,// yyyy-mm-dd
        subscription_finish_date:subscription_finish_date,
        is_active:1,//true
        account_executive_ref_id:account_executive_ref_id,
        creation_date:fechaHoy,// yyyy-mm-dd
        creation_user:creation_user,
        modification_date:null,
        modification_user:null
    }).then(productSubscription=>{
        if(productSubscription){
            logger.info(`addSubscriptionCommProduct ok`);
            return res.json({ok:true,mensaje:'Item creado',productSubscription});
        }
        else{
          logger.warn(`addSubscriptionCommProduct: El Item no pudo ser creado`);
          return res.json({
              ok:false,
              message:'El Item no pudo ser creado'
          })
      }
      }).catch(error=>{
          logger.error(`addSubscriptionCommProduct error: ${error.message}`);
          return res.status(400).json({
              ok:false,
              mensaje:error.message,
              error:error.message
          });
      }); 

} // fin addSubscriptionCommProduct


//Dar de alta un Producto nuevo
const createProductCommProduct = async (req, res) => {
    let fechaHoy= new Date().toISOString().slice(0, 10); //yyyy-mm-dd
        
    const request = { 
        product_code,
        product_name,     
        product_type_id,
        apply_eol,
        apply_ius,
        creation_date
      } = req.body;

      const createProduct = await modeloProducto.create({
        product_code:product_code,
        product_name:product_name,   
        product_type_id:product_type_id,
        apply_eol:apply_eol,
        apply_ius:apply_ius,
        creation_date:fechaHoy
      }).then(producto=>{
        if(producto){
            logger.info(`createProductCommProduct ok`);
            return res.json({ok:true,mensaje:'Producto creado',producto});
        }
        else{
          logger.warn(`createProductCommProduct: El producto no pudo ser creado`);
          return res.json({
              ok:false,
              message:'El producto no pudo ser creado'
          })
      }
      }).catch(error=>{
          logger.error(`createProductCommProduct error: ${error.message}`);
          return res.status(400).json({
              ok:false,
              mensaje:error.message,
              error:error.message
          });
      });   
} // fin createProductCommProduct


//Dar de alta un Product Scope nuevo
const createProductScopeCommProduct = async (req, res) => {
    let fechaHoy= new Date().toISOString().slice(0, 10); //yyyy-mm-dd
        
    const request = { 
        product_id,
        product_max_access_count,     
        product_max_user_count,
        scope_finish_date
      } = req.body;

      const createProductScope = await modeloProductScope.create({
        product_id:product_id,
        product_max_access_count:product_max_access_count,   
        product_max_user_count:product_max_user_count,
        scope_finish_date:scope_finish_date,
        scope_start_date:fechaHoy,
        creation_date:fechaHoy
      }).then(prodScope=>{
        if(prodScope){
            logger.info(`createProductScopeCommProduct ok`);
            return res.json({ok:true,mensaje:'Alcance de Producto creado',prodScope});
        }
        else{
          logger.warn(`createProductScopeCommProduct: El Item no pudo ser creado`);
          return res.json({
              ok:false,
              message:'El Alcance de este producto no pudo ser creado'
          })
      }

      }).catch(error=>{
          logger.error(`createProductScopeCommProduct error: ${error.message}`);
          return res.status(400).json({
              ok:false,
              mensaje:error.message,
              error:error.message
          });
      });   
} // fin createProductScopeCommProduct


// ---------------------------------------------------- RUTAS PUT--------------------------------------------------------------

//Desactivar una Suscripcion
const disableSubscriptionCommProduct = async (req, res) => {
    const {subscriber_id,product_id}=req.params;
    var body=req.body;

    if(NullChecker(subscriber_id, product_id)){
        logger.warn(`disableSubscriptionCommProduct: Peticion invalida`);
        return res.status(400).json({message: 'Peticion invalida'});
    }
    if(!UUIDChecker(subscriber_id)){
        logger.warn(`disableSubscriptionCommProduct: Ingrese un UUID valido: ${subscriber_id}`);
        return res.status(400).json({message: 'Ingrese un UUID valido'});
    }
    

    await modeloProductoSuscripcion.findOne({
        where:{subscriber_id:subscriber_id, product_id:product_id}
    }).then(modeloProductoSuscripcion=>{
        if(modeloProductoSuscripcion){
                modeloProductoSuscripcion.update({
                    is_active:body.is_active
                }).then(result=>{
                    logger.info(`disableSubscriptionCommProduct ok`);
                    return res.json({
                        //ok:true,
                        message:'Producto actualizado exitosamente',
                        result
                    });
                }).catch(error=>{
                    logger.error(`disableSubscriptionCommProduct error: ${error.message}`);
                    return res.status(400).json({
                        ok:false,
                        mensaje:error.message,
                        error:error.message,
                    });
                });           
        }
        else{
            logger.warn(`disableSubscriptionCommProduct: Suscripcion no encontrada`);
            return res.status(400).json({
                ok:false,
                message:'Suscripcion no encontrada'
            });
        }
    }).catch(error=>{
            logger.error(`disableSubscriptionCommProduct error: ${error.message}`);
            res.status(400).json({
                ok:false,
                mensaje:error.message,
                error:error.message,
            });
        }); 

} // fin disableSubscriptionCommProduct


//Modificar los datos un producto en la tabla product.
const updateProductCommProduct = async (req, res) => {
    const {product_id}=req.params;
    var body=req.body;

    if(NullChecker(product_id)){
        logger.warn(`updateProductCommProduct: Peticion invalida`);
        return res.status(400).json({message: 'Peticion invalida'});
    }
    if(!UUIDChecker(product_id)){
        logger.warn(`updateProductCommProduct: Ingrese un UUID valido: ${product_id}`);
        return res.status(400).json({message: 'Ingrese un UUID valido'});
    }

    let fechaHoy= new Date().toISOString().slice(0, 10); //yyyy-mm-dd
    await modeloProducto.findOne({
        where:{product_id:product_id}
    }).then(modeloProducto=>{
        if(modeloProducto){
                modeloProducto.update({
                    product_code:body.product_code,
                    product_name:body.product_name,
                    product_type_id:body.product_type_id,
                    apply_eol:body.apply_eol,
                    apply_ius:body.apply_ius,
                    modification_date:fechaHoy
                }).then(result=>{
                    logger.info(`updateProductCommProduct ok`);
                    return res.json({
                        //ok:true,
                        message:'Producto actualizado exitosamente',
                        result
                    });
                }).catch(error=>{
                    return res.status(400).json({
                        ok:false,
                        mensaje:error.message,
                        error:error.message,
                    });
                }); 
        }
        else{
            logger.warn(`updateProductCommProduct: Producto no encontrado`);
            return res.status(400).json({
                ok:false,
                message:'Producto no encontrado'
            });
        }
    }).catch(error=>{
            logger.error(`updateProductCommProduct error: ${error.message}`);
            res.status(400).json({
                ok:false,
                mensaje:error.message,
                error:error.message,
            });
        }); 
} // fin updateProductCommProduct


//Modificar Product Scope 
const updateProductScopeCommProduct = async (req, res) => {
    const {product_scope_id}=req.params;

    let fechaHoy= new Date().toISOString().slice(0, 10); //yyyy-mm-dd
    var body=req.body;
    
    if(!UUIDChecker(product_scope_id)){
        logger.warn(`updateProductScopeCommProduct: Ingrese un UUID valido: ${product_scope_id}`);
        return res.status(400).json({message: 'Ingrese un UUID valido'});
    }

    await modeloProductScope.findOne({
        where:{product_scope_id: product_scope_id}
    }).then(scope=>{
        if(scope){
            scope.update({
                product_id:body.product_id,
                product_max_access_count:body.product_max_access_count,   
                product_max_user_count:body.product_max_user_count,
                scope_start_date:body.scope_start_date,
                scope_finish_date:body.scope_finish_date,
                is_active:body.is_active,
                modification_date:fechaHoy                
              }).then(prodScope=>{
                if(prodScope){
                    updatePTIDenProduct(body.product_type_code,body.product_id);
                    logger.info(`updateProductScopeCommProduct ok`);
                    return res.json({ok:true,mensaje:'Alcance de Producto modificado',prodScope});
                }
                else{
                  logger.warn(`updateProductScopeCommProduct: El Alcance de este producto no pudo ser modificado`);
                  return res.json({
                      ok:false,
                      message:'El Alcance de este producto no pudo ser modificado'
                  })
              }
              }).catch(error=>{
                  logger.error(`updateProductScopeCommProduct error: ${error.message}`);
                  return res.status(400).json({
                      ok:false,
                      mensaje:error.message,
                      error:error.message
                  });
              });   
        }
        else{
            logger.warn(`updateProductScopeCommProduct: Item no encontrado`);
            return res.status(400).json({
                ok:false,
                message:'Item no encontrado'
            });
        }
    }).catch(error=>{
        logger.error(`updateProductScopeCommProduct error: ${error.message}`);
        res.status(400).json({
            ok:false,
            mensaje:error.message,
            error:error.message,
        });
    }); 
} // fin updateProductScopeCommProduct

//Modificar ProductTypeID en Tabla Product 
const updatePTIDenProduct = async (product_type_code, product_id, req, res) => {
    await modeloProductType.findOne({
        where:{product_type_code: product_type_code}
    }).then(scope=>{
        if(scope){
            let ptid=scope.product_type_id;
            //console.log(`TYPE: ${scope.product_type_id}`);
            //console.log(`Code: ${product_id}`);

            //Encontro el ID, ahora lo actualizamos en la tabla Product
            modeloProducto.findOne({
                where:{product_id}
            }).then(producto=>{
                    if(producto){
                        producto.update({
                            product_type_id:ptid
                        }).then(result=>{
                            if(result){
                                logger.info(`updatePTIDenProduct ok`);
                            }
                            else{
                                logger.warn(`updatePTIDenProduct: Producto - product_type_id no pudo ser modificado`);
                            }
                            
                        });
                    }
                    else{
                        logger.warn(`updatePTIDenProduct: Producto no encontrado`);
                        return res.status(400).json({
                            ok:false,
                            message:'Producto no encontrado'
                        });
                    }
                }).catch(error=>{
                    logger.error(`updatePTIDenProduct error: ${error.message}`);
                    return res.status(400).json({
                        ok:false,
                        message:'Producto no encontrado'
                    });
                }); 
        }
        else{
            logger.warn(`updatePTIDenProduct: product_type_code no encontrado`);
            return("product_type_id product_type_code encontrado");
        }
    }).catch(error=>{
        logger.error(`updatePTIDenProduct error: ${error.message}`);
        return("product_type_code no encontrado");
    }); 
} // fin updatePTIDenProduct

module.exports = {
    //Aca exporto los metodos
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
  }