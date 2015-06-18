var NRS = (function (NRS, $, undefined) {
    NRS.JayNewAccount = function (secretPhrase, key) {
        var account = newAccount(secretPhrase, key);
        storeAccount(account);
        NRS.setSuperNETToken(key);
        NRS.login(secretPhrase);
    }
    
    NRS.loginJayAccount = function () {
        NRS.lockLoginPanel();

        var address = $("#jay_account").html();
        var account = findAccount(address);
        var password = decryptSecretPhrase(account.cipher, $("#login_pin").val(), account.checksum);

        if (password) {
            NRS.setSuperNETToken($("#login_pin").val());
            NRS.login(password);
        }
        else {
            NRS.unlockLoginPanel();

            $.growl($.t("error_pin_number"), { "type": "danger" });
            $("#login_pin").val('');
        }
    }

    NRS.onSelectJayAccount = function (account) {
        $("#jay_account").html(account);
        $("#login_pin_div").show();

        setTimeout(function () {
            $("#login_pin").focus();
        }, 10);
    }

    NRS.onDeleteJayAccount = function (address) {
        var accounts = JSON.parse(localStorage["accounts"]);
        for (var a = 0; a < accounts.length; a++) {
            if (accounts[a]["accountRS"] == address) {
                accounts.splice(a, 1);
            }
        }
        localStorage["accounts"] = JSON.stringify(accounts);

        NRS.loadJayAccounts();
    }

    function newAccount(secretPhrase, key) {
        var accountData = {};
        accountData["secretPhrase"] = secretPhrase;
        accountData["publicKey"] = converters.byteArrayToHexString(getPublicKey(accountData["secretPhrase"]));
        accountData["accountRS"] = getAccountIdFromPublicKey(accountData["publicKey"], true);
        accountData["key"] = key;
        accountData["cipher"] = encryptSecretPhrase(accountData["secretPhrase"], key).toString();
        accountData["checksum"] = converters.byteArrayToHexString(simpleHash(converters.stringToByteArray(accountData["secretPhrase"])));
        return accountData;
    }

    function storeAccount(account) {
        var sto = [];
        if (localStorage["accounts"]) {
            sto = JSON.parse(localStorage["accounts"]);
        }
        var acc = {};
        acc["accountRS"] = account["accountRS"];
        acc["publicKey"] = account["publicKey"];
        acc["cipher"] = account["cipher"];
        acc["checksum"] = account["checksum"];
        sto.push(acc);

        localStorage["accounts"] = JSON.stringify(sto);
    }

    function getAccountIdFromPublicKey(publicKey, RSFormat) {
        var hex = converters.hexStringToByteArray(publicKey);

        _hash.init();
        _hash.update(hex);

        var account = _hash.getBytes();

        account = converters.byteArrayToHexString(account);

        var slice = (converters.hexStringToByteArray(account)).slice(0, 8);

        var accountId = byteArrayToBigInteger(slice).toString();

        if (RSFormat) {
            var address = new NxtAddress();

            if (address.set(accountId)) {
                return address.toString();
            } else {
                return "";
            }
        } else {
            return accountId;
        }
    }

    function encryptSecretPhrase(phrase, key) {
        var rkey = prepKey(key);
        return CryptoJS.AES.encrypt(phrase, rkey);
    }

    function decryptSecretPhrase(cipher, key, checksum) {
        var rkey = prepKey(key);
        var data = CryptoJS.AES.decrypt(cipher, rkey);

        if (converters.byteArrayToHexString(simpleHash(converters.hexStringToByteArray(data.toString()))) == checksum)
            return converters.hexStringToString(data.toString());
        else return false;
    }

    function prepKey(key) {
        var rounds = 1000;
        var digest = key;
        for (var i = 0; i < rounds; i++) {
            digest = converters.byteArrayToHexString(simpleHash(digest));
        }
        return digest;
    }

    function findAccount(address) {
        if (localStorage) {
            var accounts = JSON.parse(localStorage["accounts"]);
            if (accounts && accounts.length > 0) {
                for (var a = 0; a < accounts.length; a++) {
                    if (accounts[a]["accountRS"] == address) return accounts[a];
                }
            }
        }

        return false;
    }

    return NRS;

}(NRS || {}, jQuery));