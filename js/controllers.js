angular.module('healthy.controllers', [])

.controller('loginCtrl',['$scope', '$state', '$timeout', 'LoginSer', 'Global',function($scope, $state, $timeout, LoginSer, Global) {
    $scope.resetpasswd = function(email) {
        if (!email) {
            makeToast("Masukkan Email")
        } else {
            $scope.showspin2 = true;
            var result = Global.resetpass(email);
            result.then(function(bisa) {
                $scope.showspin2 = false;
                makeToast("Kata sandi berhasil dikirim ke alamat " + email)
            }, function(err) {
                $scope.showspin2 = false;
                makeToast("Gagal mengatur ulang sandi")
            })
        }
    }
    $timeout(function() {
        var result = LoginSer.cekAuth();
        result.then(function(bisa) {
            if (bisa) {
                $state.go('dash.home')
            }
        })
    }, 1000);

    function makeToast(text) {
        var snackbarContainer = document.querySelector('#demo-toast-example');
        var data = {
            message: text
        };
        snackbarContainer.MaterialSnackbar.showSnackbar(data)
    }
    $scope.user = {};
    $scope.doLogin = function(user) {
        if (!user.email || !user.pass) {
            if (!user.email) {
                makeToast("Masukkan Email")
            }
            if (!user.pass) {
                makeToast("Masukkan Password")
            }
        } else {
            $scope.showspin = true;
            var result = LoginSer.loginApp(user);
            result.then(function(bisa) {
                $scope.showspin = false;
                if (bisa == true) {
                    $state.go('dash.home')
                } else {
                    makeToast("Anda bukan pegawai")
                }
            }, function(error) {
                $scope.showspin = false;
                if (error) {
                    switch (error.code) {
                        case "INVALID_PASSWORD":
                            makeToast("Password salah,periksa kembali password anda");
                            break;
                        case "NETWORK_ERROR":
                            makeToast("Tidak terkoneksi dengan jaringan");
                            break;
                        case "INVALID_EMAIL":
                            makeToast("Email salah,periksa kembali email anda");
                            break;
                        case "INVALID_USER":
                            makeToast("User belum terdaftar");
                            break;
                        case "UNKNOWN_ERROR":
                            makeToast("Terjadi kesalahan yang tidak diketahui");
                            break;
                        default:
                            makeToast("Terjadi kesalahan yang tidak diketahui")
                    }
                }
            })
        }
    }
}]).directive('clickAnywhereButHere', function($document) {
    return {
        restrict: 'A',
        link: function(scope, elem, attr, ctrl) {
            elem.bind('click', function(e) {
                e.stopPropagation()
            });
            $document.bind('click', function() {
                scope.$apply(attr.clickAnywhereButHere)
            })
        }
    }
}).controller('AplCtrl',['$scope', 'Auth', '$filter', '$state', '$timeout', 'User','Payment', 'Asuransi', 'Antrian', 'Klinik', 'Dokter', 'LoginSer', 'Global', 'KlinikSer', 'PasienSer', 'Notify', 'ProfileSer', 'Periksa',function($scope, Auth, $filter, $state, $timeout, User,Payment, Asuransi, Antrian, Klinik, Dokter, LoginSer, Global, KlinikSer, PasienSer, Notify, ProfileSer, Periksa) {
    getProfile();
    $scope.listofKlinik = Klinik;
    $scope.listofDokter = Dokter;
    $scope.allUser = User;
    $scope.listAsuransi = Asuransi;
    $scope.shownotifbox = false;
    $scope.listantrian = Antrian;
    $scope.listbayar = Payment;
    $scope.dataprofile ;
    $scope.openimageprofile = function(nama, source) {
        $scope.tmpimg = {};
        $scope.tmpimg.nama = nama;
        $scope.tmpimg.img = source;
        $scope.showDialog('gambar')
    };

        $scope.listnotif = JSON.parse(window.localStorage.getItem("notif"));
        $scope.panjangnot = 0;
    $scope.makenotification = function() {
        $scope.shownotifbox = !$scope.shownotifbox;
        $scope.listnotif = JSON.parse(window.localStorage.getItem("notif"));
        $scope.panjangnot = 0;
    };
    $scope.hapussemuanotif = function(){
        window.localStorage.removeItem("notif");
    }
    $scope.hapusSinglenotif = function(indk){
        for (var i = $scope.listnotif.length - 1; i >= 0; i--) {
            if($scope.listnotif[i] == indk){
                $scope.listnotif.splice(i,1);
                break;
            }
        };
        window.localStorage.setItem("notif", JSON.stringify($scope.listnotif));
    }

    $scope.openonsite = function() {
        $scope.onpasien = '';
        $scope.registerbaru = {
            klinik: '',
            isasuransi: false,
            nomor_peserta: '',
            asuransi: ''
        };
        $scope.showDialog('onsite')
    };
    $scope.cekisi = function(uid) {
        if ($scope.onpasien == uid) {
            $scope.onpasien = ''
        } else {
            $scope.onpasien = uid
        }
    }

    $scope.cekisadasokter=function(){
        return Periksa.cekapaadadok();
    }

    $scope.registerPeriksa = function(baru) {
        if (!$scope.onpasien) {
            makefailtoast('Pilih pasien yang melakukan registrasi')
        } else if (!baru.klinik) {
            makefailtoast('Pilih klinik yang dituju')
        } else if (baru.isasuransi && (!baru.asuransi || !baru.nomor_peserta)) {
            if (!baru.nomor_peserta) {
                makefailtoast('Masukkan nomor peserta asuransi')
            }
            if (!baru.asuransi) {
                makefailtoast('Pilih jenis asuransi')
            }
        } else {
            if (Periksa.cekavailabledokter(baru)) {
                $scope.showspin = true;
                var time1 = Math.floor((Math.random() * 500) + 500);
                var time2 = Math.floor((Math.random() * 500) + 500);
                $timeout(function() {
                    var result = Periksa.doregisterperiksa(baru, $scope.onpasien);
                    result.then(function(nomor){
                        $scope.showspin=false;
                        $scope.hideDialog('onsite');
                        $scope.berhasil={};
                        $scope.berhasil.nama=$scope.onpasien.profile.nama;
                        $scope.berhasil.klinik=baru.klinik.nama;
                        $scope.berhasil.antrian=nomor+1;
                        $scope.showDialog('regissukses');
                    
                    },function(error){
                        makefailtoast('Gagal mendaftarkan pasien.')
                        $scope.showspin=false;
                    });
                }, time1 + time2)
            } else {
                $scope.showspin = false;
                makefailtoast('Tidak ada dokter yang tersedia untuk saat ini.');
            }
        }
    };

    $scope.openlistantrian=function(nama,antrian){
        if(antrian.listRegister){
             $scope.namakli=nama;
             $scope.listklinikantrian=antrian;
             $scope.showDialog('daftarantrian');
        }
    }

    $scope.getNamekli = function(uid) {
        if(Klinik.length !=0){
             var tmname = Klinik.$getRecord(uid);
             return tmname.nama
        }
    };
    $scope.openprofile = function() {
        if ($scope.dataprofile != undefined || $scope.dataprofile != null) {
            $state.go('dash.profile');
        }
    }


    function lakukanpembersihan(snapshot){
        var rber = new Firebase("https://easyhealthy.firebaseio.com/tmpnotif/"+snapshot.key());
        rber.remove();
        Periksa.cekdokterfromnotif(snapshot.val());
        $timeout(function(){
             $scope.listnotif = JSON.parse(window.localStorage.getItem("notif"));
              try{
                 $scope.panjangnot = $scope.listnotif.length;
             }catch(err){
                 $scope.panjangnot = 0;
             }
        },1000);
    }


     function getnotif(){
        var resperiksa = new Firebase("https://easyhealthy.firebaseio.com/tmpnotif");
        resperiksa.on("child_added", function(snapshot, prevChildKey) {
           lakukanpembersihan(snapshot);
        }, function(errorobject) {
           
        });
    }


    function getProfile() {
        getnotif();
        var ses = JSON.parse(window.localStorage.getItem("firebase:session::easyhealthy"));
        ProfileSer.getdatapegawai(ses.uid).then(function(profile) {
            $scope.dataprofile = profile;
        }, function(err) {});
    }

    $scope.showUbahprofile = function(pasien,pil) {
        window.localStorage.setItem("tampungsempas", JSON.stringify(pasien));
        $scope.editprofile = JSON.parse(window.localStorage.getItem("tampungsempas"));
        window.localStorage.removeItem("tampungsempas");
        if(pil==1){
             Global.showDialog('ubahprofilepegawai');
        }
        if(pil==2){
            $scope.editTanggal = new Date($scope.editprofile.profile.umur);
            Global.showDialog('ubahprofile');
        }
       
    };
    $scope.ubahemailprofile = function(baru) {
        $scope.showspin = true;
        var ses = JSON.parse(window.localStorage.getItem("firebase:session::easyhealthy"));
        var result = ProfileSer.ubahemail(ses.uid, $scope.dataprofile, baru);
        result.then(function(bisa) {
            $scope.hideDialog('ubahemailpegawai');
            $scope.textberhasil = "email berhasil diperbarui";
            getProfile();
            $scope.showDialog('dialog3');
            $timeout(function(){
                $scope.hideDialog('dialog3');
            },2000);
        }, function(error) {
            $scope.showspin = false;
            if (error) {
                switch (error.code) {
                    case 'EMAIL_TAKEN':
                        makefailtoast("Email sudah digunakan orang lain");
                        break;
                    case 'INVALID_PASSWORD':
                        makefailtoast("Password anda salah.");
                        break;
                    case 'INVALID_EMAIL':
                        makefailtoast("Email lama anda salah.");
                        break;
                    case 'NETWORK_ERROR':
                        makefailtoast("Periksa kembali jaringan anda");
                        break;
                    default:
                        makefailtoast("Terjadi kesalahan yang tidak diketahui")
                }
            }
        })
    };
    $scope.ubahprofilepass = function(baru) {
        $scope.showspin = true;
        var ses = JSON.parse(window.localStorage.getItem("firebase:session::easyhealthy"));
        var result = ProfileSer.ubahpassword(ses.uid, $scope.dataprofile, baru);
        result.then(function(bisa) {
            $scope.showspin = false;
            if (bisa) {
                $scope.hideDialog('ubahpasswordpegawai');
                  $scope.textberhasil = "password berhasil diperbarui";
                    getProfile();
                    $scope.showDialog('dialog3');
                    $timeout(function(){
                        $scope.hideDialog('dialog3');
                    },2000);
            }
        }, function(error) {
            $scope.showspin = false;
            if (error) {
                switch (error.code) {
                    case "NETWORK_ERROR":
                        makefailtoast("Jaringan bermasalah");
                        break;
                    case "INVALID_PASSWORD":
                        makefailtoast("Password lama salah");
                        break;
                    case "INVALID_EMAIL":
                        makefailtoast("Email admin salah");
                        break;
                    default:
                        makefailtoast("Terjadi kesalahan yang tidak diketahui")
                }
            }
        })
    }
    $scope.edituserprodfile = function(newprofiele) {
        var ses = JSON.parse(window.localStorage.getItem("firebase:session::easyhealthy"));
        ProfileSer.editprofile(ses.uid, newprofiele);
        getProfile();
        $scope.hideDialog('ubahprofilepegawai')
    }
    var connectedRef = new Firebase("https://easyhealthy.firebaseio.com/.info/connected");
    $scope.preferences = [{
        name: "Laki-Laki",
        id: 'L'
    }, {
        name: "Perempuan",
        id: 'P'
    }];
    $timeout(function() {
        connectedRef.on("value", function(snap) {
            if (snap.val() === true) {
                $scope.showsnackbar = false
            } else {
                $scope.showsnackbar = true
            }
        })
    }, 1000);
    $scope.getRandomNum = function() {
        return Global.getRandom()
    }
    $scope.checkshowdokter = function(id, listdokter) {
        if (!listdokter) {
            return false
        } else {
            if (KlinikSer.isanotavailable(id, listdokter)) {
                return false
            } else {
                return true
            }
        }
    };
    $scope.editPasien = function(pas, tgl) {
        $scope.showspin = true;
        PasienSer.editpasien(pas, tgl);
        $timeout(function() {
            $scope.hideDialog('ubahprofile')
        }, 2000)
    };
    $scope.hapuspasien = function(user) {
        $scope.showspin = true;
        var result = Global.deleteacount(user.profile.email, user.profile.pass);
        result.then(function(bisa) {
            if (bisa) {
                PasienSer.hapuspasien(user);
                $scope.hideDialog('hapuspasien');
                $state.go("dash.pasien")
            }
        }, function(error) {
            if (error) {
                switch (error.code) {
                    case "NETWORK_ERROR":
                        makeToast("Gagal menghapus user,Periksa kembali jaringan anda.");
                        break;
                    case "UNKNOWN_ERROR":
                        makeToast("Gagal, terjadi kesalahan yang tidak diketahui.");
                        break;
                    default:
                        makeToast("Gagal menghapus user,terjadi kesalahan yang tidak diketahui.");
                        break
                }
            }
        })
    };
    $scope.ubahemailpasien = function(user, baru) {
        $scope.showspin = true;
        var result = PasienSer.ubahemail(user, baru);
        result.then(function(bisa) {
            $scope.showspin = false;
            if (bisa) {
                $scope.hideDialog('ubahemailpasien')
            }
        }, function(error) {
            $scope.showspin = false;
            if (error) {
                switch (error.code) {
                    case 'EMAIL_TAKEN':
                        makefailtoast("Email sudah digunakan orang lain");
                        break;
                    case 'NETWORK_ERROR':
                        makefailtoast("Periksa kembali jaringan anda");
                        break;
                    default:
                        makefailtoast("Terjadi kesalahan yang tidak diketahui")
                }
            }
        })
    };
    $scope.ubahpasswordpasien = function(tampungpasien, newItem) {
        $scope.showspin = true;
        var result = PasienSer.ubahpassword(tampungpasien, newItem);
        result.then(function(bisa) {
            $scope.showspin = false;
            if (bisa) {
                $scope.hideDialog('ubahpassword')
            }
        }, function(error) {
            $scope.showspin = false;
            if (error) {
                switch (error.code) {
                    case "NETWORK_ERROR":
                        makefailtoast("Jaringan bermasalah");
                        break;
                    case "INVALID_PASSWORD":
                        makefailtoast("Password lama salah");
                        break;
                    case "INVALID_EMAIL":
                        makefailtoast("Email admin salah");
                        break;
                    default:
                        makefailtoast("Terjadi kesalahan yang tidak diketahui")
                }
            }
        })
    };
    $scope.tambahpasienbaru = function(user) {
        $scope.showspin = true;
        var result = PasienSer.tambahpasienbaru(user);
        result.then(function(bisa) {
            if (bisa) {
                $scope.hideDialog('tambahpasien')
            }
        }, function(error) {
            $scope.showspin = false;
            if (error) {
                switch (error.code) {
                    case "EMAIL_TAKEN":
                        makefailtoast("Email sudah digunakan orang lain");
                        break;
                    case "NETWORK_ERROR":
                        makefailtoast("Tidak terkoneksi dengan jaringan.");
                        break;
                    case "INVALID_EMAIL":
                        makefailtoast("Email yang anda masukan tidak valid");
                        break;
                    default:
                        makefailtoast("Terjadi kesalahan yang tidak diketahui")
                }
            }
        })
    };
    $scope.resetpass = function(user) {
        var result = Global.resetpass(user);
        result.then(function(bisa) {
            if (bisa) {
                makeToast("Reset password berhasil dikirim ke email " + user)
            }
        }, function(error) {
            if (error) {
                makeToast("Reset password gagal")
            }
        })
    };
    $scope.tampungdetail = function(det, pil) {
        if (pil == 1) {
            $scope.tampungpasien = det;
            $scope.realdate = new Date(det.profile.umur);
            $scope.historyperiksa = PasienSer.getRekam(det.$id);
            
        }
        if (pil == 2) {
            $scope.tampungdokter = det
        }
        if (pil == 3) {
            $scope.tampungklinik = det
        }
        if (pil == 4) {
            $scope.tampungpegawai = det
        }
    };

    function makefailtoast(txt) {
        $scope.pesangagal = txt;
        $scope.gagallagi = true;
        $timeout(function() {
            $scope.gagallagi = false
        }, 3000)
    };
    $scope.setCari = function(cari) {
        $scope.search = cari;
        $scope.currentPage=0;
    }
    $scope.judul = "Pasien";
    $scope.changejud = function(judul) {
        $scope.judul = judul;$scope.currentPage=0;
    };

    function makeToast(text) {
        var snackbarContainer = document.querySelector('#demo-toast-example');
        var data = {
            message: text
        };
        snackbarContainer.MaterialSnackbar.showSnackbar(data)
    };
    $timeout(function() {
        var result = LoginSer.cekAuth();
        result.then(function(bisa) {
            if (!bisa) {
                $state.go('login')
            }
        })
    }, 1000);

    function showAlert() {
        var dialog = document.querySelector('#dialog3');
        try {
            dialog.showModal()
        } catch (error) {
            dialogPolyfill.registerDialog(dialog);
            dialog.showModal()
        }
        $timeout(function() {
            dialog.close()
        }, 3000)
    };
    $scope.showDialog = function(tag) {
        $scope.newItem = {};
        Global.showDialog(tag)
    }
    $scope.hideDialog = function(tag) {
        $scope.showpasspasien1 = false;
        $scope.showspin = false;
        Global.hideDialog(tag)
    }
    $scope.clickOutapp = function() {
        Global.showDialog('dialog')
    };
    $scope.showdetailasuransi = function(asuransi) {
        $scope.tampungasur = asuransi;
        Global.showDialog('detailasuransi')
    };
    $scope.showloading = function() {
        $scope.showTbl = true;
        Global.showDialog('loading')
    };
    $scope.keluarApp = function() {
        Global.keluarapp()
    };
    $scope.getindoday = function(day) {
        return Global.getIndoname(day)
    };
    $scope.setsearchnull = function() {
        $scope.search = ''
    }
    //pagging
     $scope.currentPage = 0;
    $scope.pageSize = 15;
    $scope.getData = function () {

      return $filter('filter')($scope.listofDokter,$scope.search);
    }
    $scope.numberOfPages=function(){
        return Math.ceil($scope.getData().length/$scope.pageSize);
    }
     $scope.getData2 = function () {

      return $filter('filter')($scope.allUser,$scope.search);
    }
    $scope.numberOfPages2=function(){
        return Math.ceil($scope.getData2().length/$scope.pageSize);
    }

    $scope.prev=function(){
      $scope.currentPage=$scope.currentPage-1;
    }
    $scope.nexti=function(){
      $scope.currentPage=$scope.currentPage+1;
    }
    $scope.gotodetaildokterr=function(dokter){
        if(dokter){
            $scope.tampungdetail(dokter,2)
            $state.go('dash.detaildokter');
        }
    }
    $scope.resetsemuantrian=function(){
        Periksa.resetsemuaantrian(1); 
        $scope.hideDialog('anakdialogreset'); 
    }

    $timeout(function(){
            Periksa.resetsemuaantrian(2);
    },5000);
}])
.controller('BayarCtrl',['$scope','BayarSer',function($scope,BayarSer){
    function printElement(elem) {
        var domClone = elem.cloneNode(true);
    
        var $printSection = document.getElementById("printSection");
        
        if (!$printSection) {
            var $printSection = document.createElement("div");
            $printSection.id = "printSection";
            document.body.appendChild($printSection);
        }
        
        $printSection.innerHTML = "";
        
        $printSection.appendChild(domClone);
  }

    $scope.printDiv = function(divName) {
       printElement(document.getElementById(divName));
        window.print();
    }  
    $scope.getTotal=function(item){
        var t=0;
        for (var i = item.length - 1; i >= 0; i--) {
            t = t + item[i][1];
        };
        return t;

    }
    $scope.savetransaksi=function(bayar,total,klinik,idlisttmptransaksi){
        var tmp = {};
        tmp = bayar;
        tmp.klinik = klinik;
        tmp.total =total;
        BayarSer.savebayar(tmp,idlisttmptransaksi);
    }
}])

.controller('HomeCtrl',['$scope', 'Klinik', '$timeout', 'Antrian',function($scope, Klinik, $timeout, Antrian) {
    $scope.labels = [];
    $scope.data1 = [
        []
    ];
    $scope.data2 = [
        []
    ];

    function getGrapic() {
        for (var i = 0; i < Klinik.length; i++) {
            $scope.labels.push(Klinik[i].nama);
            try {
                $scope.data2[0].push(Klinik[i].listdokter.length)
            } catch (err) {
                $scope.data2[0].push(0)
            }
            try {
                $scope.data1[0].push(Antrian[i].listRegister.length)
            } catch (err) {
                $scope.data1[0].push(0)
            }
        };
        if ($scope.labels[0] == undefined) {
            $timeout(function() {
                getGrapic()
            }, 1000)
        }
    }
    getGrapic()
}]).controller('RegisCtrl',['$scope','Periksa','$timeout',function($scope,Periksa,$timeout) {
    $scope.getNamapasien=function(id){
       return Periksa.getnamapasien(id);
    }
    $scope.getAlamatpasien=function(id){
       return Periksa.getalamatpasien(id);
    }
     $scope.gettelppasien=function(id){
       return Periksa.gettelephone(id);
    }

    $scope.resetantrian=function(antrian){
             Periksa.resetantrian(antrian);
             $scope.hideDialog('resetantrian');
             $scope.hideDialog('daftarantrian');
    };

    function hapuslistnotif(uid){
        try{
            for (var i = $scope.listnotif.length - 1; i >= 0; i--) {
                if($scope.listnotif[i].idk == uid){
                    $scope.listnotif.splice(i,1);
                }
            };
            window.localStorage.setItem("notif", JSON.stringify($scope.listnotif));
             $scope.listnotif = JSON.parse(window.localStorage.getItem("notif"));
        }catch(error){

        }
    }

    $scope.lakukanpemeriksaan=function(klinik,idpasien){
        try{
                    if(klinik.regis < klinik.listRegister.length-1){
                        Periksa.perikantrianpasien(klinik,idpasien);
                        hapuslistnotif(klinik.$id);
                    } 
        }catch(error){

        }
    }
    $scope.lompatiantrianberikutnya=function(klinik){
        try{
            if(klinik.regis < klinik.listRegister.length-1){
                Periksa.lopatiselanjutnya(klinik);
            }
        }catch(err){

        }
    }
    $scope.getdokter=function(klinik){
        return Periksa.getdokterjaga(klinik);
    }

}])

.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});