#include "WPkcs12.h"

@implementation WPkcs12

RCT_EXPORT_MODULE();
/*
 * issuerName
 * serialNumber
 * password - пароль для pkcs12
 * name - имя pkcs12
 * filename - путь к файлу, куда будет экспортирован pkcs12
 */
//экспорт pkcs12
RCT_EXPORT_METHOD(ExportPKCS12: (NSString *)issuerName: (NSString *)serialNumber: (NSString *)password: (NSString *)name: (NSString *)filename: (RCTResponseSenderBlock)callback){
  char *pIssuerName = (char *) [issuerName UTF8String];
  char *pSerialNumber = (char *) [serialNumber UTF8String];
  char *pPwd = (char *) [password UTF8String];
  char *pName = (char *) [name UTF8String];
  char *pFilename = (char *) [filename UTF8String];
  try{
    OpenSSL::run();
    
    //read cert file
    TrustedHandle<Filter> filterByCert = new Filter();
    
    filterByCert->setIssuerName(new std::string(pIssuerName));
    filterByCert->setSerial(new std::string(pSerialNumber));
    
    TrustedHandle<PkiItemCollection> pic = g_storeCrypto->find(filterByCert);
    if (pic->length() <= 0){
      callback(@[[@"This certificate was not found in the 'crypto' store!" copy], [NSNumber numberWithInt: 0]]);
      return;
    }
    
    TrustedHandle<PkiItem> pi = new PkiItem();
    pi = pic->items(0);
    
    TrustedHandle<Certificate> hcert = g_storeCrypto->getItemCert(pi);
    
    //findKey
    TrustedHandle<Filter> filterByKey = new Filter();
    filterByKey->setHash(pi->certKey);
    TrustedHandle<PkiItemCollection> picKey = g_storeCrypto->find(filterByKey);
    if (picKey->length() <= 0){
      callback(@[[@"No private key found for this certificate in the 'crypto' store!" copy], [NSNumber numberWithInt: 0]]);
      return;
    }
    TrustedHandle<PkiItem> piKey = picKey->items(0);
    TrustedHandle<Key> hkey = g_storeCrypto->getItemKey(piKey);
    
    //find all TRUST certs
    TrustedHandle<Filter> filterByTrustCerts = new Filter();
    filterByTrustCerts->setCategory(new std::string("TRUST"));
    TrustedHandle<PkiItemCollection> picTrustCerts = g_storeCrypto->find(filterByTrustCerts);
    if (picTrustCerts->length() <= 0){
      callback(@[[@"This certificates was not found in the 'crypto' store!" copy], [NSNumber numberWithInt: 0]]);
      return;
    }
    TrustedHandle<CertificateCollection> hcerts = new CertificateCollection();
    for (int i = 0; i < picTrustCerts->length(); i++){
      hcerts->push(g_storeCrypto->getItemCert(picTrustCerts->items(i)));
    }

    //построение цепочки сертификатов(chain) по сертификату
    TrustedHandle<Chain> chain = new Chain();
    TrustedHandle<CertificateCollection> ca = chain->buildChain(hcert, hcerts);
    //create pkcs12
    TrustedHandle<Pkcs12> pkcs12 = new Pkcs12();
    pkcs12->create(hcert, hkey, ca, pPwd, pName);
    
    TrustedHandle<Bio> out = new Bio(BIO_TYPE_FILE, pFilename, "wb");
    pkcs12->write(out);
    out->flush();
    
    callback(@[[NSNull null], [NSNumber numberWithInt: 1]]);
  }
  catch (TrustedHandle<Exception> e){
    callback(@[[@((e->description()).c_str()) copy], [NSNumber numberWithInt: 0]]);
  }
}

//импорт pkcs12 (формат p7b не поддерживает)
RCT_EXPORT_METHOD(ImportPKCS12: (NSString *)filename: (NSString *)passwordForPFX: (NSString *)passwordForKey: (RCTResponseSenderBlock)callback){
  char *pFilename = (char *) [filename UTF8String];
  char *pPwdPFX = (char *) [passwordForPFX UTF8String];
  char *pPwdKey = (char *) [passwordForKey UTF8String];
  try{
    OpenSSL::run();
    p12 = new Pkcs12();
    TrustedHandle<Bio> in = NULL;
    in = new Bio(BIO_TYPE_FILE, pFilename, "rb");
    p12->read(in);
    
    //save cert in store
    TrustedHandle<Certificate> cert = p12->getCertificate(pPwdPFX);
    TrustedHandle<std::string> folder = new std::string(g_pathToStore);
    TrustedHandle<Provider> prov = new Provider_System(folder);
    g_storeCrypto->addPkiObject(prov, new std::string("MY"), cert);
    
    //save key in store
    TrustedHandle<Key> key = p12->getKey(pPwdPFX);
    g_storeCrypto->addPkiObject(prov, key, new std::string(pPwdKey));
    
    //save TRUST certs in store
    TrustedHandle<CertificateCollection> certs = p12->getCACertificates(pPwdPFX);
    for (int i = 0; i < certs->length(); i++){
      TrustedHandle<Certificate> cert_i = certs->items(i);
      g_storeCrypto->addPkiObject(prov, new std::string("TRUST"), cert);
    }
    
    callback(@[[NSNull null], [NSNumber numberWithInt: 1]]);
  }
  catch (TrustedHandle<Exception> e){
    callback(@[[@((e->description()).c_str()) copy], [NSNumber numberWithInt: 0]]);
  }
}

@end
