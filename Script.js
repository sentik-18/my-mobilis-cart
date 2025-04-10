/* ================= مفاتيح Firebase ================= */
const firebaseConfig = {
  apiKey: "AIzaSyDeXwR9h6I3aybr3ILhRu3S36OMPRy3-ls",  
  authDomain: "my-mobilis-cart.firebaseapp.com",
  databaseURL: "https://my-mobilis-cart-default-rtdb.firebaseio.com",
  projectId: "my-mobilis-cart",
  storageBucket: "my-mobilis-cart.firebasestorage.app",
  messagingSenderId: "354016673153",
  appId: "1:354016673153:web:8dbcb7d01aea5b3fa57c80"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const storage = firebase.storage();

// مفتاح Vision API
const visionAPIKey = "AIzaSyAe5cLoi0II5qljAwOnLfUocXFQmd5pFOI";

// متغيراتك
let currentUser = "";
let extractedCodes = [];
let uploadedImageFile = null;

/* دالة تسجيل الدخول */
function login(){
  const user= document.getElementById("username").value.trim();
  const pass= document.getElementById("password").value.trim();
  db.ref("users/"+ user).once("value").then(snap=>{
    if(!snap.exists()){
      document.getElementById("loginMsg").textContent="المستخدم غير موجود";
      return;
    }
    const data= snap.val();
    const today= new Date().toISOString().split("T")[0];
    if(data.password!== pass){
      document.getElementById("loginMsg").textContent="كلمة المرور خاطئة";
      return;
    }
    if(data.expiryDate && today> data.expiryDate){
      document.getElementById("loginMsg").textContent="انتهت صلاحية الحساب";
      return;
    }
    currentUser= user;
    // نخفي صفحة الدخول
    document.getElementById("loginBox").style.display="none";
    // نظهر واجهات التطبيق
    document.getElementById("appBox").style.display="block";
    document.getElementById("historyBox").style.display="block";
    document.getElementById("searchBox").style.display="block";
    loadHistory();
  });
}

/* تحليل الصورة ... */
async function analyzeImage(){
  const debugBox= document.getElementById("debugMessages");
  debugBox.style.color="blue";
  debugBox.textContent="جاري التحليل...";

  const file= document.getElementById("imageInput").files[0];
  if(!file){
    debugBox.textContent="لا توجد صورة مختارة.";
    return;
  }
  uploadedImageFile= file;

  try {
    // أي دوال مطلوبة
    const base64= await fileToBase64(file);
    const body= {
      requests:[{
        image:{ content: base64 },
        features:[{ type:"DOCUMENT_TEXT_DETECTION" }]
      }]
    };
    const res= await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${visionAPIKey}`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify(body)
    });
    const data= await res.json();
    debugBox.textContent="Vision response:\n"+ JSON.stringify(data,null,2);

    const full= data.responses?.[0]?.fullTextAnnotation;
    if(!full){
      debugBox.style.color="red";
      debugBox.textContent+="\nلم يتم اكتشاف نص.";
      return;
    }

    const text= full.text||"";
    const matches= text.match(/\b\d{4}\s\d{4}\s\d{4}\s\d{3}\b/g) || [];
    extractedCodes= matches.map(m=>m.replace(/\s/g,""));
    document.getElementById("codeCount").textContent= `عدد الأكواد: ${extractedCodes.length}`;
    document.getElementById("codeArea").value= extractedCodes.join("\n");

    // رسم اطارات
    // ...الخ

  } catch(err){
    debugBox.style.color="red";
    debugBox.textContent= "خطأ أثناء التحليل: "+ err.message;
  }
}

// دالة fileToBase64
function fileToBase64(file){
  return new Promise((resolve,reject)=>{
    const reader= new FileReader();
    reader.onload= ()=>{
      const base64= reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror= err=> reject(err);
    reader.readAsDataURL(file);
  });
}

/* بقية الدوال: combineSymbols, mergeBoxes, drawUnifiedBox, drawWordBox... */

/* إدخال الأكواد الناقصة */
function addMissingCodes(){ ... }

/* تنزيل الأكواد */
function downloadCodes(){ ... }

/* حفظ في Firebase */
async function saveToFirebase(){ ... }

/* تحميل السجل */
function loadHistory(){ ... }
function showAllCodes(recordKey){ ... }
function downloadRecordCodes(codesArray){ ... }
function deleteRecord(recordKey, imageUrl){ ... }

/* البحث عن الكود فقط */
function searchOnlyImage(){ ... }