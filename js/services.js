angular.module('healthy.services', [])

.factory("Auth",['$firebaseAuth',function($firebaseAuth) {
  var usersRef = new Firebase("https://easyhealthy.firebaseio.com/");
  return $firebaseAuth(usersRef);
}])


.factory('Klinik', ['$firebaseArray', function($firebaseArray) {
  var itemsRef = new Firebase('https://easyhealthy.firebaseio.com/klinik');
  return $firebaseArray(itemsRef);
}])

.factory('Antrian', ['$firebaseArray', function($firebaseArray) {
  var itemsRef = new Firebase('https://easyhealthy.firebaseio.com/antrian');
  return $firebaseArray(itemsRef);
}])

.factory('Payment', ['$firebaseArray', function($firebaseArray) {
  var itemsRef = new Firebase('https://easyhealthy.firebaseio.com/history/bayar');
  return $firebaseArray(itemsRef);
}])

.factory('Uang', ['$firebaseArray', function($firebaseArray) {
  var itemsRef = new Firebase('https://easyhealthy.firebaseio.com/keuangan');
  return $firebaseArray(itemsRef);
}])

.factory('Rekam', ['$firebaseArray', function($firebaseArray) {
  var itemsRef = new Firebase('https://easyhealthy.firebaseio.com/rekam');
  return $firebaseArray(itemsRef);
}])


.factory('Dokter', ['$firebaseArray', function($firebaseArray) {
  var itemsRef = new Firebase('https://easyhealthy.firebaseio.com/dokter');
  return $firebaseArray(itemsRef);
}])

.factory('User', ['$firebaseArray', function($firebaseArray) {
  var itemsRef = new Firebase('https://easyhealthy.firebaseio.com/users');
  return $firebaseArray(itemsRef);
}])
.factory('Asuransi', ['$firebaseArray', function($firebaseArray) {
  var itemsRef = new Firebase('https://easyhealthy.firebaseio.com/asuransi');
  return $firebaseArray(itemsRef);
}])



.service('LoginSer',['Auth','$q','ProfileSer',function(Auth,$q,ProfileSer){
  
  this.loginApp = function(user){
    var deferred = $q.defer();
      Auth.$authWithPassword({
                email: user.email,
                password: user.pass
      }).then(function (authData) {
          var res =ProfileSer.getdatapegawai(authData.uid);
         res.then(function(bisa){
              deferred.resolve(true);
         },function(gagal){
           deferred.resolve(false);
         });
       }).catch(function (error) {
           deferred.reject(error);
        });
    return deferred.promise;
  }

  this.cekAuth = function(){
    var deferred = $q.defer();
    Auth.$onAuth(function (authData) {
            if (authData) {
               deferred.resolve(true);
            }else{
              deferred.resolve(false);
            }
    });
    return deferred.promise;
  }
}])

.service('Notify',['webNotification','Global',function(webNotification,Global){
  this.makenotify = function(img,text,nama){
          Global.playsound();
          webNotification.showNotification(nama || 'Periksa selanjutnya', {
                body: text || 'Notification Text...',
                icon: img || 'img/doctor-flat.png',
                onClick: function onNotificationClicked() {
                    
                }
            }, function onShow(error, hide) {
                if (error) {
                    window.alert('Unable to show notification: ' + error.message);
                } else {
                    setTimeout(function hideNotification() {
                     hide();
                    }, 60000000);
                }
            });
  }
}])

.service('BayarSer',['$q','Payment','Uang','User',function($q,Payment,Uang,User){
    this.savebayar = function(bayar,id){
      var p = User.$getRecord(bayar.pasien);
      p.regis.klinik=null;
      p.regis.antrian=null;
      p.regis.asuransi=null;
      p.regis.nopeserta=null;
      p.regis.status=false;
      User.$save(p);
      Uang.$add(bayar);
      Payment.$remove(id);
    }

}])

.service('Global',['$q','Auth','$state','$filter',function($q,Auth,$state,$filter){


  this.getRandom = function(){
    return Math.floor((Math.random() * 10) + 1);
  }

  this.playsound = function(){
    var sound = new Audio('sound/pling.mp3');
    sound.play();
  }

  this.showDialog=function(tag){
    var dialog = document.querySelector('#'+tag);
    try{
      dialog.showModal();
    }catch(error){
      dialogPolyfill.registerDialog(dialog);
      dialog.showModal();
    }
  }

  this.hideDialog=function(tag){
    var dialog = document.querySelector('#'+tag);
     dialog.close();
  }

  this.getIndoname = function(day){
    var indo = $filter('date')(day, 'EEEE');
      switch(indo){
      case 'Monday' :
              indo='Senin';
              break;
       case 'Tuesday' :
            indo='Selasa';
            break;
      case 'Wednesday' :
              indo='Rabu';
              break;
       case 'Thursday' :
            indo='Kamis';
            break;
        case 'Friday' :
            indo='Jumat';
            break;
      case 'Saturday' :
              indo='Sabtu';
              break;
       case 'Sunday' :
            indo='Minggu';
            break;
       default :
            indo='Error';
      }
      return indo;
  }

  this.deleteacount = function(usremail,usrpass){
    var deferred = $q.defer();
    var ref = new Firebase("https://easyhealthy.firebaseio.com/");
        ref.removeUser({
          email    : usremail,
          password : usrpass
        }, function(error) {
          if (error === null) {
            deferred.resolve(true);
          } else {
            deferred.reject(error);
          } 
        });
       return deferred.promise;
  }

  this.resetpass = function(user){
        var deferred = $q.defer();
        var ref = new Firebase("https://easyhealthy.firebaseio.com/");
        ref.resetPassword({
          email : user
        }, function(error) {
          if (error === null) {
            deferred.resolve(true);
          } else {
            deferred.reject(error);
          }
        });
        return deferred.promise;
     }
  this.keluarapp = function(){
     Auth.$unauth();
     $state.go('login');
  }
}])

.service('Periksa',['$q','Dokter','User','$timeout','Klinik','Antrian','Notify',function($q,Dokter,User,$timeout,Klinik,Antrian,Notify){
  this.cekapaadadok=function(){
    var stat=true;
    var kelin = {};
    for (var i = 0; i < Klinik.length; i++) {
      kelin.klinik=Klinik[i];
      if(cekavailabledokter2(kelin,2)){
        stat=false;
      }
    };
    return stat;
  }

  function makenotif(nama,dokter,tmp,idk){
    if(Dokter.length != 0){
      var itemno={};
      itemno.photo=dokter;
      itemno.ket = "Antrian selanjutnya di Klinik "+nama;
      itemno.dok = Dokter.$getRecord(dokter).nama;
      itemno.tmp = tmp;
      itemno.idk = idk;

      if(!JSON.parse(window.localStorage.getItem("notif"))){
      var listno = [];
      }
      else{
      var listno = JSON.parse(window.localStorage.getItem("notif"));
      }

      listno.push(itemno);
      window.localStorage.setItem("notif", JSON.stringify(listno));

      Notify.makenotify(Dokter.$getRecord(dokter).photo,itemno.ket,itemno.dok);
    }
    else{
      $timeout(function(){
        makenotif(nama,dokter,tmp,idk);
      },1500);
    }
  }

  function cekallklinik(id){
    var kelin = {};
    var stat = false;
    if(Klinik.length != 0){
       for (var i = 0; i < Klinik.length; i++) {
          kelin.klinik = Klinik[i];
          if(cekavailabledokter2(kelin,2) == id.from){
            stat=true;
            break;
          }
       };
       if(stat){
         makenotif(kelin.klinik.nama,id.from,id.tmp,kelin.klinik.$id);
       }

    }
    else{
      $timeout(function(){
        cekallklinik(id);
      },1500);
    }
  }

  this.cekdokterfromnotif=function(id){
    cekallklinik(id);
  }


  this.getdokterjaga = function(klinik){
    var kelin = {};
    kelin.klinik = Klinik.$getRecord(klinik.$id);
    if(cekavailabledokter2(kelin,1)){
      return Dokter.$getRecord(cekavailabledokter2(kelin,2));
    }
  }

  function sendpasientodokter(dokter,idpasien){
    if(dokter){
      dokter.periksa = idpasien;
      Dokter.$save(dokter);
    }
  }

  function givenotiflewat(id){
    var pas = User.$getRecord(id);
    pas.regis.asuransi = null;
    pas.regis.nopeserta = null;
    pas.regis.status=false;
    pas.regis.antrian = "LEWAT";
     User.$save(pas);
  }

  this.lopatiselanjutnya=function(klinik){
    savehistoryklinik(klinik.$id,2,3);
    givenotiflewat(klinik.listRegister[klinik.regis+1].idpasien);
    klinik.listRegister[klinik.regis+1].s=true;
    klinik.listRegister[klinik.regis+1].asuransi=null;
    klinik.listRegister[klinik.regis+1].nopeserta=null;
    klinik.regis=klinik.regis+1;
    Antrian.$save(klinik);
  }

  this.perikantrianpasien=function(klinik,idpasien){
    var kelin = {};
    kelin.klinik = Klinik.$getRecord(klinik.$id);
    if(cekavailabledokter2(kelin,1)){
      var newklinik = klinik;
      newklinik.regis=newklinik.regis+1;
      Antrian.$save(newklinik).then(function(){
         sendpasientodokter(Dokter.$getRecord(cekavailabledokter2(kelin,2)),idpasien);
         savehistoryklinik(klinik.$id,3,2);
      });
    }else{
       console.log('tidak ada');
    }
  }

  this.isanotavailable = function(id,datalist){
      var tmp = true;
      for (var i = 0; i < datalist.length; i++) {
        if(datalist[i] == id){
          tmp = false;
        }
      };
      return tmp;
  }
  this.cekjam=function(){
    var t = new Date();
      return a = t.getHours() >= 23 ? true : false;
  }

  function cekjamprak(jam,menit,itemlist,pil){
        var balik = false;
        try{
          if(itemlist.start && itemlist.end){
            var day1 = new Date(itemlist.start);
            var day2 = new Date(itemlist.end);
            if(pil==1){
               balik = (jam>=day1.getHours()-1 && jam<=day2.getHours()) ||  (jam==day2.getHours() && menit<day2.getMinutes()) ? true : false;
            }
            if(pil==2){
                balik = ((jam==day1.getHours() && menit >= day1.getMinutes()) || (jam==day2.getHours() && menit<day2.getMinutes()) || (jam>day1.getHours() && jam<day2.getHours())) ? true : false;
            }
           
          }
        }catch(error){ 

        }

        return balik;

    };

  function cekJadwaldokterklinik(key,pil){
       var stat = false;
       var day = new Date();
       var today = day.getDay();
       var jam = day.getHours();
       var menit = day.getMinutes();
       var dokterkli = Dokter.$getRecord(key);
       try{
             switch(today){
         case 0 :  stat = cekjamprak(jam,menit,dokterkli.listjadwal[6],pil); break;
         case 1 : stat = cekjamprak(jam,menit,dokterkli.listjadwal[0],pil);break;
        case 2 : stat = cekjamprak(jam,menit,dokterkli.listjadwal[1],pil); break;
         case 3 : stat = cekjamprak(jam,menit,dokterkli.listjadwal[2],pil);break;
        case 4 :  stat = cekjamprak(jam,menit,dokterkli.listjadwal[3],pil); break;
         case 5 : stat = cekjamprak(jam,menit,dokterkli.listjadwal[4],pil);break;
         case 6 :  stat =  cekjamprak(jam,menit,dokterkli.listjadwal[5],pil);break;

         }
       }catch(error){

       }
       return stat;
     
    };

    function cekavailabledokter2(item,pil){
      var ada;
      try{
        var datadok = item.klinik.listdokter;
        for (var i = 0; i < item.klinik.listdokter.length; i++) {
          ada = cekJadwaldokterklinik(datadok[i],pil);
          if(ada){
            if(pil==2){
              ada=datadok[i];
            }
            break;
          }
        };
      }catch(error){

      }
      
      return ada;
    }

    this.cekavailabledokter=function(item){
      return cekavailabledokter2(item,1);
    };


     function updatestatususer(number,item,dataAccount){
    var refuse = new Firebase("https://easyhealthy.firebaseio.com/users/"+dataAccount.$id + "/regis");
     var refkli = new Firebase("https://easyhealthy.firebaseio.com/antrian/"+item.klinik.$id+"/listRegister/"+number);
     
       refkli.once("value", function(snapshot) {
         var isi = snapshot.val();
         if(!isi || isi.idpasien != dataAccount.$id){
           doregisterperiksa2(item,dataAccount);
         }
         else{
            refuse.update({
                status: true,
                antrian: (number+1),
                klinik: item.klinik.$id,
           });
            
         }
      }, function (errorObject) {
          
            
      });
     
   };


    function doputdatainantrian(number,item,dataAccount){
      var deferred = $q.defer();
      var ref = new Firebase("https://easyhealthy.firebaseio.com/antrian/"+item.klinik.$id+"/listRegister/"+number);
      ref.transaction(function(currentData) {
        if (currentData === null) {

          return { nomor_antrian: (number+1),
           idpasien:dataAccount.$id || '',
           asuransi:item.asuransi.$id || null,
           nopeserta:item.nomor_peserta || null
       };
        } else {
          return; 
        }
      }, function(error, committed, snapshot) {
      if (error) {
              deferred.reject(error);
      } else if (!committed) {
         doregisterperiksa2(item,dataAccount);
      } else {
         deferred.resolve(number);
         updatestatususer(number,item,dataAccount);
      }

      });
      return deferred.promise;
    }

    function doregisterperiksa2(item,dataAccount) {
        var deferred = $q.defer();
        var ref = new Firebase("https://easyhealthy.firebaseio.com/antrian/"+item.klinik.$id+"/listRegister");
        ref.once("value", function(snapshot) {
          var pjg = 0;
          if(snapshot.val()){
             pjg = snapshot.val().length;
          }
          var result = doputdatainantrian(pjg,item,dataAccount );
          result.then(function(nomor){
            deferred.resolve(nomor)
          },function(error){
            deferred.reject(error);
          });
        }, function (errorObject) {
           deferred.reject(errorobject);
        });
        return deferred.promise;
    }

    this.doregisterperiksa=function(item,dataAccount){
      return doregisterperiksa2(item,dataAccount);
    }
    this.getnamapasien=function(id){
       try{
            var nm =User.$getRecord(id).profile.nama;
            if(nm){
                return nm;
            }
        }catch(error){
            
        }
    }
    this.getalamatpasien=function(id){
      try{
            var nm =User.$getRecord(id).profile.alamat;
            if(nm){
                return nm;
            }
        }catch(error){
            
        }
    }
    this.gettelephone=function(id){
       try{
            var nm =User.$getRecord(id).profile.nomor_telp;
            if(nm){
                return nm;
            }
        }catch(error){
            
        }
    }

    function setfalse(idpas){
      try{
        var pasien = User.$getRecord(idpas);
        if(pasien.regis.status){
          pasien.regis.status=false;
          pasien.regis.antrian =null;
          pasien.regis.klinik=null;
          User.$save(pasien);
        }
      }catch(err){

      }
    }

    function savehistoryklinik(uid,panjang,pil) {
        var today = new Date();
        var refsave = new Firebase("https://easyhealthy.firebaseio.com/history/klinik/"+uid);
        refsave.child(today.getMonth()).once("value",function(snapshot){
            var j;
            switch(pil){
              case 1 : 
                      try{
                          j=snapshot.val().jum; 
                        refsave.child(today.getMonth()).update({
                            jum : j+panjang
                        });
                        }catch(error){
                            refsave.child(today.getMonth()).update({
                                jum : panjang
                            });
                        }
                      break;
              case 2 : 
                      try{
                          j=snapshot.val().a; 
                        refsave.child(today.getMonth()).update({
                            a : j+1
                        });
                        }catch(error){
                            refsave.child(today.getMonth()).update({
                                a : 1
                            });
                        }
                      break;
              case 3 : 
                      try{
                          j=snapshot.val().t; 
                        refsave.child(today.getMonth()).update({
                            t : j+1
                        });
                        }catch(error){
                            refsave.child(today.getMonth()).update({
                                t : 1
                            });
                        }
                      break;
            }
        },function(errorobject){

        });

    }



    function resetsingleantrian(antrian){
       savehistoryklinik(antrian.$id,antrian.listRegister.length,1);
      for (var i = 0; i < antrian.listRegister.length; i++) {
        setfalse(antrian.listRegister[i].idpasien);
      };
      var an = Antrian.$getRecord(antrian.$id);
      an.regis= -1;
      an.listRegister = null;
      Antrian.$save(an);

    }

    this.resetantrian=function(antrian){
       resetsingleantrian(antrian);
    }

    function resetallantrian(){
      var tgl = new Date();
      if(tgl.getHours() >= 23 || tgl.getHours() == 0){
        for (var i = 0; i < Antrian.length; i++) {
          if(Antrian[i].listRegister){
            resetsingleantrian(Antrian[i]);
          }
        };
      }else{
        $timeout(function(){
          resetallantrian();
        },3600000);
      }
      
    }

    this.resetsemuaantrian=function(pil){
      if(pil==1){
        for (var i = 0; i < Antrian.length; i++) {
          if(Antrian[i].listRegister){
            resetsingleantrian(Antrian[i]);
          }
        };
      }else{
          resetallantrian();
      }
    }

}])


.service('KlinikSer',['$q','Klinik',function($q,Klinik){
  
  this.isanotavailable=function(id,datalist){
     var tmp = true;
      for (var i = 0; i < datalist.length; i++) {
        if(datalist[i] == id){
          tmp = false;
        }
      };
      return tmp;
  }

}])

.service('ProfileSer',['$q','Auth',function($q,Auth){
  this.getdatapegawai=function(uid){
    var deferred = $q.defer();
    var ref = new Firebase("https://easyhealthy.firebaseio.com/pegawai/"+ uid );
      ref.once("value",function(snapshot){
         var userData = snapshot.val();
         try{
            if(userData.status == null || userData.status != 'pegawai'){
             Auth.$unauth();deferred.reject(false);
           }
           else{
            deferred.resolve(userData);
           }
         }catch(err){
          Auth.$unauth();
          deferred.reject(false);
         }
        },function(errorobject){
          deferred.reject(false);
      });
      return deferred.promise;
  }
  this.editprofile = function(uid,newprofiele){
    var ref = new Firebase("https://easyhealthy.firebaseio.com/pegawai/"+uid);
    ref.update({
      nama:newprofiele.nama,
      alamat:newprofiele.alamat,
      photo:newprofiele.photo,
      nomor_telp:newprofiele.nomor_telp
    });
  }
  this.ubahemail = function(uid,user,baru){
    var deferred = $q.defer();
    var ref = new Firebase("https://easyhealthy.firebaseio.com/pegawai/"+uid);
     ref.changeEmail({
        oldEmail : user.email,
        newEmail : baru.email,
        password : baru.pass
      }, function(error) {
        if (error === null) {
            ref.update({
                email:baru.email
            });
            deferred.resolve(true);
               
        } else {
           deferred.reject(error);
        }
      });
     return deferred.promise;
  }
    this.ubahpassword=function(uid,user,baru){
    var deferred = $q.defer();
    var ref = new Firebase("https://easyhealthy.firebaseio.com/pegawai/"+uid );
      ref.changePassword({
        email       : user.email,
        oldPassword : baru.ini,
        newPassword : baru.pass
      }, function(error) {
        if (error === null) {
          ref.update({
            pass:baru.pass
          });
          deferred.resolve(true);
        } else {
          deferred.reject(error);
        }
      });
    return deferred.promise;
  }
}])

.service('PasienSer',['Auth','User','$q','Rekam',function(Auth,User,$q,Rekam){
    

   this.hapuspasien = function(user){
    User.$remove(user);
   }  

   this.getRekam = function(uid){
    return Rekam.$getRecord(uid);
   }

  this.tambahpasienbaru = function(user){
    var deferred = $q.defer();
       Auth.$createUser({
                email: user.email,
                password: user.pass
       }).then(function (userData) {
                var userRef = new Firebase('https://easyhealthy.firebaseio.com/users');
                userRef.child(userData.uid).child('profile').set({
                    'nama': user.nama,
                    'ktp' : user.ktp,
                    'kelamin':  user.kelamin,
                    'umur' : ''+user.umur+'',
                    'alamat': user.alamat,
                    'nomor_telp' : user.nomor_telp,
                    'email': user.email,
                    'photo' : '',
                    'lengkap':true ,
                    'pass' :user.pass
                });
               deferred.resolve(true);
            }).catch(function (error) {
                  if (error) {
                    deferred.reject(error);
                  }
            });
         return deferred.promise;
  }



  this.editpasien=function(pas,tgl){
          var ref = new Firebase("https://easyhealthy.firebaseio.com/users/"+pas.$id +"/profile");
          ref.update({
            alamat:pas.profile.alamat,
            kelamin:pas.profile.kelamin,
            ktp : pas.profile.ktp,
            nama: pas.profile.nama,
            nomor_telp: pas.profile.nomor_telp,
            umur : tgl
          });
  }
  this.ubahemail = function(user,baru){
    var deferred = $q.defer();
    var ref = new Firebase("https://easyhealthy.firebaseio.com/users/"+user.$id +"/profile");
     ref.changeEmail({
        oldEmail : user.profile.email,
        newEmail : baru.ulang,
        password : user.profile.pass
      }, function(error) {
        if (error === null) {
            ref.update({
                email:baru.email
            });
            deferred.resolve(true);
               
        } else {
           deferred.reject(error);
        }
      });
     return deferred.promise;
  }

  this.ubahpassword=function(tampungpasien,baru){
    var deferred = $q.defer();
    var ref = new Firebase("https://easyhealthy.firebaseio.com/users/"+tampungpasien.$id +"/profile");
      ref.changePassword({
        email       : tampungpasien.profile.email,
        oldPassword : tampungpasien.profile.pass,
        newPassword : baru
      }, function(error) {
        if (error === null) {
          ref.update({
            pass:baru
          });
          deferred.resolve(true);
        } else {
          deferred.reject(error);
        }
      });
    return deferred.promise;
  }
}])

;
