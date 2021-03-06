/**
 * @depends {nrs.js}
 * @depends {nrs.modals.js}
 */
var NRS = (function(NRS, $, undefined) {

    NRS.forms.dividendPayment = function($modal) {
        var data = NRS.getFormData($modal.find("form:first"));

        data.asset = NRS.currentAsset.asset;

        if (!data.amountNXTPerShare) {
            return {
                "error": $.t("error_amount_per_share_required")
            }
        }
        else {
            data.amountNQTPerQNT = NRS.calculatePricePerWholeQNT(
                NRS.convertToNQT(data.amountNXTPerShare),
                NRS.currentAsset.decimals);
        }

        if (!/^\d+$/.test(data.height)) {
            return {
                "error": $.t("error_invalid_height")
            }
        }

        delete data.amountNXTPerShare;

        return {
            "data": data
        };
    };

    $("#dividend_payment_modal").on("hidden.bs.modal", function() {
        $(this).find(".dividend_payment_info").first().hide();
    });

    $("#dividend_payment_amount_per_share").keydown(function(e) {
        var decimals = NRS.currentAsset.decimals;

        var charCode = !e.charCode ? e.which : e.charCode;
        if (NRS.isControlKey(charCode) || e.ctrlKey || e.metaKey) {
            return;
        }
        return NRS.validateDecimals(8-decimals, charCode, $(this).val(), e);
   	});

    $("#dividend_payment_amount_per_share, #dividend_payment_height").on("blur", function() {
        var $modal = $(this).closest(".modal");
        var amountNXTPerShare = $modal.find("#dividend_payment_amount_per_share").val();
        var height = $modal.find("#dividend_payment_height").val();

        var $callout = $modal.find(".dividend_payment_info").first();

        showDividendPaymentInfoPreview($callout, amountNXTPerShare, height);
    });

    function showDividendPaymentInfoPreview($callout, amountNXTPerShare, height) {
        var classes = "callout-info callout-danger callout-warning";

        if (!amountNXTPerShare) {
            $callout.html($.t("error_amount_per_share_required"));
            $callout.removeClass(classes).addClass("callout-warning").show();
        }
        else if (!/^\d+$/.test(height)) {
            $callout.html($.t("error_invalid_height"));
            $callout.removeClass(classes).addClass("callout-warning").show();
        }
        else {
            NRS.getAssetAccounts(
                NRS.currentAsset.asset,
                height,
                function (response) {
                    var accountAssets = response.accountAssets;

                    var qualifiedDividendRecipients = accountAssets.filter(
                        function(accountAsset) {
                            return accountAsset.accountRS !== NRS.currentAsset.accountRS
                                && accountAsset.accountRS !== NRS.genesisRS
                        });

                    var totalQuantityQNT = new BigInteger("0");
                    qualifiedDividendRecipients.forEach(
                        function (accountAsset) {
                            totalQuantityQNT = totalQuantityQNT.add(new BigInteger(accountAsset.quantityQNT));
                        });

                    var priceNQT = new BigInteger(NRS.calculatePricePerWholeQNT(
                        NRS.convertToNQT(amountNXTPerShare),
                        NRS.currentAsset.decimals));

                    var totalNXT = NRS.calculateOrderTotal(totalQuantityQNT, priceNQT);

                    $callout.html($.t(
                        "dividend_payment_info_preview_success",
                        {
                            "amountNXT": totalNXT,
                            "totalQuantity": NRS.formatQuantity(totalQuantityQNT, NRS.currentAsset.decimals),
                            "recipientCount": qualifiedDividendRecipients.length
                        }));
                    $callout.removeClass(classes).addClass("callout-info").show();
                },
                function (response) {
                    var displayString;

                    if (response.errorCode == 4 || response.errorCode == 8) {
                        displayString = $.t("error_invalid_height");
                    }
                    else {
                        displayString = $.t(
                            "dividend_payment_info_preview_error",
                            {"errorCode": response.errorCode})
                    }

                    $callout.html(displayString);
                    $callout.removeClass(classes).addClass("callout-warning").show();
                });
        }
    }

    return NRS;
}(NRS || {}, jQuery));
