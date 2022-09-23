const modeloProducto = require("../models/Product.js");
const modeloProductoSuscripcion = require("../models/Product_Subscription");
const modeloSubscriber = require("../models/Subscriber");
const modeloProductScope = require("../models/Product_Scope");
const modeloProductType = require("../models/Product_Type");
const { Sequelize} = require("sequelize");
const {logger}=require("../models/Logger");
const UUIDChecker = require("../middlewares/UUIDChecker");
const NullChecker = require("../middlewares/NullChecker");
var moment = require('moment'); 

const Op = Sequelize.Op;

const parseJwt=async (token)=>{
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}
// ---------------------------------------------------- RUTAS GET--------------------------------------------------------------
const getProducts = async (req, res) => {
    const pageAsNumber=Number.parseInt(req.query.page);
    const sizeAsNumber=Number.parseInt(req.query.size);
    // const pageAsNumber=Number.parseInt(req.headers["page"]);
    // const sizeAsNumber=Number.parseInt(req.headers["size"]);

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
        logger.info(`ProductScope: getProducts ok`);
        res.status(200).json(lista);
    })
   .catch( (error)=>{
        logger.error(`ProductScope: getProducts error: ${error.message}`);
        res.json({error:error});
    })
}

const obtenerProductoEspecifico= async (product_code) => {
    //sirve para devolver el product_id en getSubscriberSuscriptionCommProduct
    let id=0;
    await modeloProducto.findOne({
        where: {product_code} 
      })
    .then( (data)=>{
            id=data.dataValues.product_id;
    })
    .catch( (error)=>{
            console.log(`error: ${error}`);
    });
    return id;
}


// Todas las suscripciones por Suscriptor
const getSubscriberSuscriptionCommProduct= async (req, res) => {
    const {subscriber_id}= req.params;
    const pageAsNumber=Number.parseInt(req.query.page);
    const sizeAsNumber=Number.parseInt(req.query.size);

    let where={};
    let fechaInicio= req.query.subscription_start_date;
    let fechaFin= req.query.subscription_finish_date;
    let is_active= req.query.is_active;
    let product_id= req.query.product_id;
    let product_code= req.query.product_code;

    let page=0;
    let size=10;

    var validaStartDate = moment(fechaInicio);
    var validaFinishDate = moment(fechaFin);


    if(!subscriber_id){
        logger.warn(`getSubscriberSuscriptionCommProduct: No se ingreso subscriber_id`);
        return res.status(400).json({message: "No se ingreso subscriber_id."})
    }

    if(!UUIDChecker(subscriber_id)){
        logger.warn(`ProductScope: getSubscriberSuscriptionCommProduct: Ingrese un UUID valido: ${subscriber_id}`);
        return res.status(400).json({message: 'Ingrese un UUID valido'});
    }
    

    if(!Number.isNaN(pageAsNumber)&& pageAsNumber>0){
        page=pageAsNumber;
    }

    if(!Number.isNaN(sizeAsNumber) && sizeAsNumber>0 && sizeAsNumber<10){
        size=sizeAsNumber;
    }

    if(subscriber_id){
        where.subscriber_id= {
            [Op.eq]: subscriber_id
        }
    }
    
    if(fechaInicio){
        if(!validaStartDate.isValid()){
            logger.warn(`getSubscriberSuscriptionCommProduct: Fecha de inicio invalida`);
            return res.status(400).json({message: "Fecha de inicio invalida"})
        }else{
            if(validaStartDate)
            {
                where.subscription_start_date= {
                    [Op.gte]: validaStartDate
                }
            }
        }
    }
    if(fechaFin){
        if(!validaFinishDate.isValid()){
            logger.warn(`getSubscriberSuscriptionCommProduct: Fecha de finalizacion invalida`);
            return res.status(400).json({message: "Fecha de finalizacion invalida"})
        }else{
            if(validaFinishDate)
            {
                where.subscription_finish_date= {
                    [Op.lte]: validaFinishDate
                }
            }
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
    if(product_code){
        //obtengo el product_id pasandole el product_Code
       await obtenerProductoEspecifico(product_code)
        .then(productoObtenido => {
            where.product_id= {
                [Op.eq]: productoObtenido
            }
        });
    }
    console.log(where);
    const { count } = await modeloProductoSuscripcion.findAndCountAll({
        where,
        limit:size,
        offset:page*size
    })
    res.header('X-Total-Count', count);
   await modeloProductoSuscripcion.findAll({ 
    limit:size,
    offset:page*size,
    include: [{ model: modeloProducto, include: [modeloProductScope,modeloProductType]}],
       where,
       order: [[modeloProducto,'product_name', 'ASC'], ['product_subscription_id', 'ASC' ]]

   })
   .then( (data)=>{
        if (data.length===0) 
        { 
            logger.warn(`ProductScope: getSubscriberSuscriptionCommProduct: Datos no encontrados`);
            return res.status(204).json({message: "Datos no encontrados."});
        }
        else{
            logger.info(`ProductScope: getSubscriberSuscriptionCommProduct ok`);
            return res.status(200).json(data);
        }
   })
  .catch( (error)=>{
        logger.error(`ProductScope: getSubscriberSuscriptionCommProduct error: ${error.message}`);
       res.json({error:error.message});
   });
}


//Todas las suscripciones por Producto
const getBySuscriptionProductIdCommProduct= async (req, res) => {
    const {product_id}= req.params;
    let is_active= req.query.is_active;
    let where={};
    const pageAsNumber=Number.parseInt(req.query.page);
    const sizeAsNumber=Number.parseInt(req.query.size);
    let page=0;
    let size=10;

    if(!product_id){
        logger.warn(`getBySuscriptionProductIdCommProduct: No se ingreso product_id`);
        return res.status(400).json({message: "No se ingreso product_id."})
    }

    if(!UUIDChecker(product_id)){
        logger.warn(`ProductScope: getBySuscriptionProductIdCommProduct: Ingrese un UUID valido: ${product_id}`);
        return res.status(400).json({message: 'Ingrese un UUID valido'});
    }

    //Verificar si existe este producto..
    const _product = await modeloProducto.findOne(
    {
        where: {
            product_id:product_id
        }
    })
    if(!_product){
        logger.warn(`ProductScope: getBySuscriptionProductIdCommProduct - Datos no encontrados ${_product}`);
        return res.status(400).json({message: "Datos no encontrados"});
    }

    if(!Number.isNaN(pageAsNumber)&& pageAsNumber>0){
        page=pageAsNumber;
    }

    if(!Number.isNaN(sizeAsNumber) && sizeAsNumber>0 && sizeAsNumber<10){
        size=sizeAsNumber;
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

    const { count } = await modeloProducto.findAndCountAll({
        where,
        limit:size,
        offset:page*size
    })
    res.header('X-Total-Count', count);

   await modeloProducto.findAll({ 
        limit:size,
        offset:page*size,
        include:[{model:modeloProductoSuscripcion},{model:modeloProductScope},{model:modeloProductType}],
        where,
        order: [[modeloProductoSuscripcion,'subscriber_id', 'ASC'], [modeloProductoSuscripcion, 'product_subscription_id', 'ASC' ]]
   })
   .then( (data)=>{
       if(data){
            logger.info(`ProductScope: getBySuscriptionProductIdCommProduct ok`);
            return res.status(200).json(data);
       }
       else{
            logger.warn(`ProductScope: getBySuscriptionProductIdCommProduct: Datos no encontrados`);
            return res.status(404).json({message: "Datos no encontrados."})
       }
   })
  .catch( (error)=>{
        logger.error(`ProductScope: getBySuscriptionProductIdCommProduct error: ${error.message}`);
        res.json({error:error.message});
   });
}


//Traer producto especifico por codProd ERP
const getProductCommProduct= async (req, res) => {
    const {product_code}= req.params;

    if(!product_code){
        logger.warn(`getProductCommProduct: No se ingreso product_code`);
        return res.status(400).json({message: "No se ingreso product_code."})
    }

    await modeloProducto.findOne({
        include: [modeloProductScope,modeloProductType], 
        where: {product_code} 
      })
   .then( (data)=>{
       if(data){
            logger.info(`ProductScope: getProductCommProduct ok`);
            return res.json(data);
       }
       else{
            logger.warn(`ProductScope: getProductCommProduct: Datos no encontrados`);
            return res.status(404).json({message: "Datos no encontrados."})
       }
   })
  .catch( (error)=>{
        logger.error(`ProductScope: getProductCommProduct error: ${error.message}`);
        res.json({error:error.message});
   });
}

//Lista de Productos por tipo 
const getAllProductsCommProduct= async (req, res) => {
    const pageAsNumber=Number.parseInt(req.query.page);
    const sizeAsNumber=Number.parseInt(req.query.size);
    let page=0;
    let size=10;

    let where={};

    let product_type_id= req.query.product_type_id;
    let product_type_code= req.query.product_type_code;
    let apply_eol= req.query.apply_eol;
    let apply_ius= req.query.apply_ius;

    if(!Number.isNaN(pageAsNumber)&& pageAsNumber>0){
        page=pageAsNumber;
    }

    if(!Number.isNaN(sizeAsNumber) && sizeAsNumber>0 && sizeAsNumber<10){
        size=sizeAsNumber;
    }

    if(product_type_code)
    {
        const ptc = await modeloProductType.findOne(
        {where: {product_type_code}})
        if(ptc){
            product_type_id=ptc.product_type_id
        }
    }


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

    const { count } = await modeloProducto.findAndCountAll({
        where,
        limit:size,
        offset:page*size
    })
    res.header('X-Total-Count', count);

   await modeloProducto.findAll({ 
        limit:size,
        offset:page*size,
        //include:[{model:modeloProductType,model:modeloProductScope}],
        include: [modeloProductScope,modeloProductType], 
        where,
        order: [['product_name', 'ASC'], ['product_code', 'ASC' ]]
   })
   .then( (data)=>{
        if (data.length===0) 
        { 
            logger.warn(`ProductScope: getAllProductsCommProduct: Datos no encontrados`);
            return res.status(404).json({message: "Datos no encontrados."})
        }
        else{
            logger.info(`ProductScope: getAllProductsCommProduct ok`);
            return res.status(200).json(data);
        }
   })
  .catch( (error)=>{
        logger.error(`ProductScope: getAllProductsCommProduct error: ${error.message}`);
        res.json({error:error.message});
   });
}


// ---------------------------------------------------- RUTAS POST--------------------------------------------------------------
//Alta de Producto-Suscripcion
const addSubscriptionCommProduct = async (req, res) => { 
    //let fechaHoy= new Date().toISOString().slice(0, 10);    
    const request = { 
        subscriber_id,
        product_id,
        subscription_start_date,     
        subscription_finish_date,
        account_executive_ref_id,
        creation_user
      } = req.body;
    
    let req2=await parseJwt(req.token); 

    let fechaHoy = moment();  
    var validaStartDate = moment(subscription_start_date);
    var validaFinishDate = moment(subscription_finish_date);


    if(!UUIDChecker(subscriber_id)){
        logger.warn(`ProductScope: addSubscriptionCommProduct: Ingrese un UUID valido: ${subscriber_id}`);
        return res.status(400).json({message: 'Ingrese un UUID valido'});
    }
    if(!UUIDChecker(product_id)){
        logger.warn(`ProductScope: addSubscriptionCommProduct: Ingrese un UUID valido: ${product_id}`);
        return res.status(400).json({message: 'Ingrese un UUID valido'});
    }

    //verifico si existe el suscriptor
    const suscriptor = await modeloSubscriber.findByPk(subscriber_id);
    //verifico si existe el producto
    const producto = await modeloProducto.findByPk(product_id);

    if(!suscriptor){
      logger.warn(`addSubscriptionCommProduct: Suscriptor no existente: ${suscriptor}`);
      return res.status(404).json({message: "Suscriptor no existente"});
    }

    if(!product_id || !producto){
        logger.warn(`addSubscriptionCommProduct: No se ingreso product_id`);
        return res.status(400).json({message: "No se ingreso producto para el suscriptor o este es inexistente"})
    }
    if(!validaStartDate.isValid() || validaStartDate>=fechaHoy){
        logger.warn(`addSubscriptionCommProduct: Fecha de inicio de suscripcion invalida`);
        return res.status(400).json({message: "Fecha de inicio de suscripcion invalida"})
    }
    if(!validaFinishDate.isValid() || validaFinishDate<=fechaHoy){
        logger.warn(`addSubscriptionCommProduct: Fecha de finalizacion de suscripcion invalida`);
        return res.status(400).json({message: "Fecha de finalizacion de suscripcion invalida"})
    }
    
    if(!account_executive_ref_id){
        account_executive_ref_id=1;
    }

    //Verificamos si la relacion ya existe
    const existeSuscripcion = await modeloProductoSuscripcion.findOne({
        where: {
          subscriber_id: subscriber_id,
          product_id: product_id,
          is_active:true
        }
      });
      
      //Si ya existe devolvemos el resultado
      if(existeSuscripcion){
        logger.warn(`addSubscriptionCommProduct: Ya existe una suscripción para el producto y suscriptor informados: ${existeSuscripcion}`);
        return res.status(200).json({message: "Ya existe una suscripción para el producto y suscriptor informados."});
      }

      //que la fecha que ingresan no sea menor a la de hoy, ver: https://desarrolladores.me/2020/03/manipular-fechas-con-moment-js/
      const createProductSubscription = await modeloProductoSuscripcion.create({
        subscriber_id:subscriber_id,
        product_id:product_id,   
        subscription_start_date:validaStartDate,
        subscription_finish_date:validaFinishDate,
        is_active:1,//true
        account_executive_ref_id:account_executive_ref_id,
        creation_date:fechaHoy,// yyyy-mm-dd
        creation_user:req2.idpData.email,
        modification_date:null,
        modification_user:null
    }).then(productSubscription=>{
        if(productSubscription){
            logger.info(`ProductScope: addSubscriptionCommProduct ok`);
            return res.status(201).json({ok:true,mensaje:'Item creado',productSubscription});
        }
        else{
          logger.warn(`ProductScope: addSubscriptionCommProduct: El Item no pudo ser creado`);
          return res.status(400).json({
              ok:false,
              message:'El Item no pudo ser creado'
          })
      }
      }).catch(error=>{
          logger.error(`ProductScope: addSubscriptionCommProduct error: ${error.message}`);
          return res.status(404).json({
              ok:false,
              mensaje:error.message,
              error:error.message
          });
      }); 

} // fin addSubscriptionCommProduct


//Dar de alta un Producto nuevo
const createProductCommProduct = async (req, res) => {
    let fechaHoy = moment();  
        
    const request = { 
        product_code,
        product_name,     
        product_type_code,
        apply_eol,
        apply_ius,
        creation_date
      } = req.body;

      //Verificar si existe un producto con el id de producto informado
      const _product = await modeloProducto.findOne(
        {
            where: {product_code}
        })
        if(_product){
          logger.warn(`ProductScope: createProductCommProduct - Producto ya existente ${product_code}`);
          return res.status(200).json({message: "Producto ya existente"});
        }

        //Verificar si existe un ProductType con product_type_code informado
        const _productType = await modeloProductType.findOne(
        {
            where: {product_type_code}
        })
    
        if(!_productType){
            logger.warn(`ProductScope: createProductCommProduct - product type code inexistente ${product_type_code}`);
            return res.status(400).json({message: "product type code inexistente"});
        }

        if(!apply_eol || !apply_ius){
            logger.warn(`ProductScope: createProductCommProduct - apply_eol/apply_ius no informado`);
            return res.status(400).json({message: "apply_eol/apply_ius no informado"});
        }
      const createProduct = await modeloProducto.create({
        product_code:product_code,
        product_name:product_name,   
        product_type_id:_productType.product_type_id,
        apply_eol:apply_eol,
        apply_ius:apply_ius,
        creation_date:fechaHoy
      }).then(producto=>{
        if(producto){
            logger.info(`ProductScope: createProductCommProduct ok`);
            return res.status(201).json({ok:true,mensaje:'Producto creado',producto});
        }
        else{
          logger.warn(`ProductScope: createProductCommProduct: El producto no pudo ser creado`);
          return res.status(400).json({
              ok:false,
              message:'El producto no pudo ser creado'
          })
      }
      }).catch(error=>{
          logger.error(`ProductScope: createProductCommProduct error: ${error.message}`);
          return res.status(404).json({
              ok:false,
              mensaje:error.message,
              error:error.message
          });
      });   
} // fin createProductCommProduct


//Dar de alta un Product Scope nuevo
const createProductScopeCommProduct = async (req, res) => {
    let fechaHoy= moment();
        
    const request = { 
        product_id,
        product_max_access_count,     
        product_max_user_count,
        scope_finish_date
      } = req.body;

      //Verificar si existe este producto..
        const _producto = await modeloProducto.findByPk(product_id)
        .then(_producto=>{
            if(!_producto){
                return res.status(400).json({message: "Producto no encontrado"});
            }
        }).catch((err) => res.status(404).json({message: "Producto no encontrado"}));

        //Verificar si ya existe un alcance activo para el producto
        const _productScope = await modeloProductScope.findOne(
        {
            where: {
                product_id:product_id,
                is_active:"true"
            }
        })
        if(_productScope){
            logger.warn(`ProductScope: createProductScopeCommProduct - Ya existe un alcance de producto activo para el id producto informado ${product_id}`);
            return res.status(200).json({message: "Ya existe un alcance de producto activo para el id producto informado"});
        }

      const createProductScope = await modeloProductScope.create({
        product_id:product_id,
        product_max_access_count:product_max_access_count,   
        product_max_user_count:product_max_user_count,
        scope_finish_date:scope_finish_date,
        scope_start_date:fechaHoy,
        creation_date:fechaHoy
      }).then(prodScope=>{
        if(prodScope){
            logger.info(`ProductScope: createProductScopeCommProduct ok`);
            return res.status(201).json({ok:true,mensaje:'Alcance de Producto creado',prodScope});
        }
        else{
            logger.warn(`ProductScope: createProductScopeCommProduct: El Item no pudo ser creado`);
            return res.status(400).json({
                ok:false,
                message:'El Alcance de este producto no pudo ser creado'
            })
        }
      }).catch(error=>{
          logger.error(`ProductScope: createProductScopeCommProduct error: ${error.message}`);
          return res.status(404).json({
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
    let req2=await parseJwt(req.token); 

    let fechaHoy = moment();  
    if(!product_id || !subscriber_id){
        logger.warn(`disableSubscriptionCommProduct: No se ingreso product_id y/o subscriber_id`);
        return res.status(400).json({message: "No se ingreso product_id y/o subscriber_id."})
    }

    if(NullChecker(subscriber_id, product_id)){
        logger.warn(`ProductScope: disableSubscriptionCommProduct: Peticion invalida`);
        return res.status(400).json({message: 'Peticion invalida'});
    }
    if(!UUIDChecker(subscriber_id)){
        logger.warn(`ProductScope: disableSubscriptionCommProduct: Ingrese un UUID valido: ${subscriber_id}`);
        return res.status(400).json({message: 'Ingrese un UUID valido'});
    }
    

    await modeloProductoSuscripcion.findOne({
        where:{subscriber_id:subscriber_id, product_id:product_id}
    }).then(modeloProductoSuscripcion=>{
        if(modeloProductoSuscripcion){
                modeloProductoSuscripcion.update({
                    is_active:0,
                    modification_date:fechaHoy,
                    modification_user:req2.idpData.email
                }).then(result=>{
                    logger.info(`ProductScope: disableSubscriptionCommProduct ok`);
                    return res.status(201).json({
                        //ok:true,
                        message:'Producto actualizado exitosamente',
                        result
                    });
                }).catch(error=>{
                    logger.error(`ProductScope: disableSubscriptionCommProduct error: ${error.message}`);
                    return res.status(404).json({
                        ok:false,
                        mensaje:error.message,
                        error:error.message,
                    });
                });           
        }
        else{
            logger.warn(`ProductScope: disableSubscriptionCommProduct: Suscripcion no encontrada`);
            return res.status(400).json({
                ok:false,
                message:'Suscripcion no encontrada'
            });
        }
    }).catch(error=>{
            logger.error(`ProductScope: disableSubscriptionCommProduct error: ${error.message}`);
            res.status(404).json({
                ok:false,
                mensaje:error.message,
                error:error.message,
            });
        }); 

} // fin disableSubscriptionCommProduct


//Modificar los datos un producto en la tabla product.
const updateProductCommProduct = async (req, res) => {
try 
{
    const {product}=req.params;

    const request = {
        product_code,
        product_id,
        product_name,
        product_type_code,
        apply_eol,
        apply_ius
    } = req.body;
    
    let where={};

    if(!product){
        logger.warn(`updateProductCommProduct: No se ingreso el producto`);
        return res.status(400).json({message: "No se ingreso el producto."})
    }

    if(NullChecker(product)){
        logger.warn(`ProductScope: updateProductCommProduct: Peticion invalida`);
        return res.status(400).json({message: 'Peticion invalida'});
    }
    if(!UUIDChecker(product)){
        where.product_code= {
            [Op.eq]: product
        }
    }
    else{
        where.product_id= {
            [Op.eq]: product
        }
    }    

     //Verificar si existe un producto con el id de producto informado
    const _product = await modeloProducto.findOne(
    {
        where
    })
    if(!_product){
        logger.warn(`ProductScope: updateProductCommProduct - No existe el producto con el id de producto informado ${product_id}`);
        return res.status(400).json({message: "No existe el producto con el id de producto informado"});
    }

   
  //Verificar si existe un ProductType con product_type_code informado
    const _productType = await modeloProductType.findOne(
    {
        where: {product_type_code}
    })
    if(!_productType){
        logger.warn(`ProductScope: updateProductCommProduct - product type code inexistente ${product_type_code}`);
        return res.status(400).json({message: "product type code inexistente"});
    }

    let fechaHoy= moment();
    await modeloProducto.findOne({
        where
    }).then(modeloProducto=>{
        if(modeloProducto){
            console.log(modeloProducto);
                modeloProducto.update({
                    product_code:product_code,
                    product_name:product_name,
                    product_type_id:_productType.product_type_id,
                    apply_eol:apply_eol,
                    apply_ius:apply_ius,
                    modification_date:fechaHoy
                }).then(result=>{
                    logger.info(`ProductScope: updateProductCommProduct ok`);
                    return res.status(201).json({
                        //ok:true,
                        message:'Producto actualizado exitosamente',
                        result
                    });
                }).catch(error=>{
                    return res.status(404).json({
                        ok:false,
                        mensaje:error.message,
                        error:error.message,
                    });
                }); 
        }
        else{
            logger.warn(`ProductScope: updateProductCommProduct: Producto no encontrado`);
            return res.status(400).json({
                ok:false,
                message:'Producto no encontrado'
            });
        }
    }).catch(error=>{
            logger.error(`ProductScope: updateProductCommProduct error: ${error.message}`);
            res.status(404).json({
                ok:false,
                mensaje:error.message,
                error:error.message,
            });
        }); 
} catch (error) {
    logger.error(`ProductScope: updateProductCommProduct error: ${error.message}`);
    res.status(404).json({
        ok:false,
        mensaje:"Ha ocurrido un error, asegurese de ingresar los campos correspondientes",
        error:error.message,
    });
}
    
} // fin updateProductCommProduct


//Modificar Product Scope 
const updateProductScopeCommProduct = async (req, res) => {
    const {product_scope_id}=req.params;
    let fechaHoy= moment();
    const request = {
        product_id,
        product_max_access_count,
        product_max_user_count,
        scope_start_date,
        scope_finish_date,
        is_active
    } = req.body;

    if(!product_scope_id){
        logger.warn(`updateProductScopeCommProduct: No se ingreso el product_scope_id`);
        return res.status(400).json({message: "No se ingreso el product_scope_id."})
    }
    if(!UUIDChecker(product_scope_id)){
        logger.warn(`ProductScope: updateProductScopeCommProduct: Ingrese un UUID valido: ${product_scope_id}`);
        return res.status(400).json({message: 'Ingrese un UUID valido'});
    }
 
    var validaStartDate = moment(scope_start_date);
    var validaFinishDate = moment(scope_finish_date);
    if(!validaStartDate.isValid() || validaStartDate>=fechaHoy){
        logger.warn(`updateProductScopeCommProduct: Fecha de inicio invalida`);
        return res.status(400).json({message: "Fecha de inicio invalida"})
    }
    if(!validaFinishDate.isValid() || validaFinishDate<=fechaHoy){
        logger.warn(`updateProductScopeCommProduct: Fecha de finalizacion invalida`);
        return res.status(400).json({message: "Fecha de finalizacion invalida"})
    }

    if(!is_active){
        return res.status(400).json({message: "El campo is_active no fue informado"})
    }

    await modeloProductScope.findOne({
        where:{product_scope_id: product_scope_id}
    }).then(scope=>{
        if(scope){
            scope.update({
                product_id:product_id,
                product_max_access_count:product_max_access_count,   
                product_max_user_count:product_max_user_count,
                scope_start_date:validaFinishDate,
                scope_finish_date:validaFinishDate,
                is_active:is_active,
                modification_date:fechaHoy                
              }).then(prodScope=>{
                if(prodScope){
                    //updatePTIDenProduct(body.product_type_code,body.product_id);
                    logger.info(`ProductScope: updateProductScopeCommProduct ok`);
                    return res.status(201).json({ok:true,mensaje:'Alcance de Producto modificado',prodScope});
                }
                else{
                  logger.warn(`ProductScope: updateProductScopeCommProduct: El Alcance de este producto no pudo ser modificado`);
                  return res.status(400).json({
                      ok:false,
                      message:'El Alcance de este producto no pudo ser modificado'
                  })
              }
              }).catch(error=>{
                  logger.error(`ProductScope: updateProductScopeCommProduct error: ${error.message}`);
                  return res.status(404).json({
                      ok:false,
                      mensaje:error.message,
                      error:error.message
                  });
              });   
        }
        else{
            logger.warn(`ProductScope: updateProductScopeCommProduct: Item no encontrado`);
            return res.status(400).json({
                ok:false,
                message:'Item no encontrado'
            });
        }
    }).catch(error=>{
        logger.error(`ProductScope: updateProductScopeCommProduct error: ${error.message}`);
        res.status(404).json({
            ok:false,
            mensaje:"Debe cargar correctamente los campos",
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
                                logger.info(`ProductScope: updatePTIDenProduct ok`);
                            }
                            else{
                                logger.warn(`ProductScope: updatePTIDenProduct: Producto - product_type_id no pudo ser modificado`);
                            }
                            
                        });
                    }
                    else{
                        logger.warn(`ProductScope: updatePTIDenProduct: Producto no encontrado`);
                        return res.status(400).json({
                            ok:false,
                            message:'Producto no encontrado'
                        });
                    }
                }).catch(error=>{
                    logger.error(`ProductScope: updatePTIDenProduct error: ${error.message}`);
                    return res.status(400).json({
                        ok:false,
                        message:'Producto no encontrado'
                    });
                }); 
        }
        else{
            logger.warn(`ProductScope: updatePTIDenProduct: product_type_code no encontrado`);
            return("product_type_id product_type_code encontrado");
        }
    }).catch(error=>{
        logger.error(`ProductScope: updatePTIDenProduct error: ${error.message}`);
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
