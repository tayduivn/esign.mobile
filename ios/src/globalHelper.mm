#include "globalHelper.h"

char * g_pathToStore = "/Users/dev/Downloads/Users\ 9/admin/Desktop/Prototype_Trusted_IOS/ios/tests/store";
int countCSPCerts = 0;
int countCryptoCerts = 0;
TrustedHandle<PkiStore> g_storeCrypto = new PkiStore(new std::string(g_pathToStore));
TrustedHandle<PkiItemCollection> g_picCSP = new PkiItemCollection();
//TrustedHandle<PkiItemCollection> g_picCrypto = new PkiItemCollection();
