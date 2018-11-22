// ==============================
//      PUERTO
// ==============================
process.env.PORT = process.env.PORT || 3000;


// ==============================
//      ENTORNO
// ==============================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ==============================
//      ENTORNO
// ==============================

let urlDB;
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = 'mongodb://cafe-user:*admin1@ds161630.mlab.com:61630/cafedb';
}

process.env.URLDB = urlDB;