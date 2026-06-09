import firebaseAdmin from "firebase-admin";

export const firebaseConfig = {
  type: "service_account",
  project_id: "college-project-97ee3",
  private_key_id: "1995f2af4e8ba4586ace0ffcfa7662ae4d0448a6",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDaihRk6mBe2IbN\nuUQ0GIbbR06rAK+wgCNj4ZDzxYdWeGFYP7RZD7YvdugE3lwPLgt8wAhWSkAZhz41\nhanpFoBaWR2LP3B1RtBYFLoDmssGe7M5lOafr+Gk9xk+nISAM08ntmag7u2mtV4A\nKlMQ1Y0qb8SYZ18GWF7eZvZyBQm9qeehiWiD9de3wXeNVkjOTQas/bihxN8Fw8TU\nVDw3s6qx/gDIvqVdS0aqpBeNelNxCsJFNweSGkhy1WvOdSnD9T+AjLsAcfkv/amr\nDRV1Q/o+3BTYcPAX0IKsNscDwQPRBb2JpjQ8xBSVzggjtaROBvSkyrTGcYlL/lUr\nBad/BrNhAgMBAAECggEAVvzoYkTyyD4K5n9suQncQBNRqnqS9EAFFkBWiNni5ZX0\nNYLiACNjYuBDOZDi9v3ef7EWgHZ8rkypg/do6wlUXOIlAuTlGCFwU+coJcArOTDq\n5awx4nVJbXcX+talXTxPMSEHF98TBK0jthAi0UwXrUEg8YMQDYAGfyNfzIHZ3z6y\nPiOTLYcfEbhLmEL4gBL0pSB97oz8DS2fcQoc104JexQxByJz5mzR/WYNk3ZnzoZL\nzPlZvm2BcID8YlPD6J+1ocC/1ZmI/ZvREGWrtwivzdyAncte+PUAXDfJj0hLi1RH\n7TSIaurjTbTTJ6sNxAaDixhsQRcDz4B0NchAJSFMAwKBgQDzdgdJP03MEwBtBcLM\n9UEqx7FfGyuSdQLV+j1YmLQ6O6iGU/5GWHQvfFDfsajA3dx9dxvLO/QMQiNAPmkE\n8nANmyj5ayDwPQvEwZ6e+c0DVBLZfMKr/z9mLBn9IqfyF8XqZkpYh/CQna5lJ/Gg\ne5DtPI7AAh3hGwIGb8xuF/pm+wKBgQDly3ceO1ruFPpMwqhdRf8M2XyBBlPLPxL6\nRzSKtOXZCKgO1UM227vyfbOA7020snmZVMGJwedzGgIE02GfPjVnWH5SC2ETAaW9\nXH9Yig2ukk3zLonqBj7K46E4GBWclqJGt4D/CRO7oCdwk5La1dHGU+zsrjHXM+mN\nRoCI5yTwUwKBgAm7ojbvbPDHobC6FjuTYnOPYCvpLijAvMhJJMKx+CKL2ATmvreZ\nOavcUG9g7tonBHWPmXDaiLskubwLwq8L8ibZGR4/hiWUiy/mfazlV6jWZ5qCPlYZ\n8jLneHKCPCyVfrgMNtSrOpbNdvdcTXCZAAY78YkDjKY/KimPtqCAHOaZAoGAX/Yf\nwFg5GMNZ40RG2uyoHc2U2KyzwWSNoEasAmCYu5GJ3OfiMb6BNjqYA3frk1IUxZtH\nVyfKZ56syScc1Us9MfMajViDKVS+yd0esPK10/j05GDC5x/EiSWV5b7pB4NAMRfg\nnqBDxU6UKcb2xLwV5iSWBCCaX6wmFAElHAaqvlECgYEAjd6iWNaqDJAe7BIQlQl0\nH1MByqMEVOxIx3lc08wjGbm8Z4WKY9CEAO5gRF99BkerGRQQh/qPhabEdNBDJliN\nkpfxmu1BCVscjdBcrbJV20lhT3XYP49QScwHHM9YSiGcR7mkSkfmnuHin/KOaUmP\neQc2NCCT+yLY8rUED1RnvK4=\n-----END PRIVATE KEY-----\n",
  client_email:
    "firebase-adminsdk-fbsvc@college-project-97ee3.iam.gserviceaccount.com",
  client_id: "111423106431740954948",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40college-project-97ee3.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(firebaseConfig),
});

export default firebaseAdmin;
