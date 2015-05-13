function run_test() { var md = do_get_cwd().parent;
    md.append("enigmailCommon.jsm");
    do_load_module("file://" + md.path);
    shouldHandleNoDataErrors();
    shouldHandleErrorOutput_test();
}

function shouldHandleNoDataErrors() {
  var errorOutput = "gpg: no valid OpenPGP data found.\n" +
    "[GNUPG:] NODATA 1\n" +
    "[GNUPG:] NODATA 2\n" + 
    "gpg: decrypt_message failed: Unknown system error\n"; 

  var result = EnigmailCommon.parseErrorOutput(errorOutput, response = {});

  Assert.assertContains(result, "no valid OpenPGP data found");
}

function shouldHandleErrorOutput_test() {
    var errorOutput = "[GNUPG:] USERID_HINT 781617319CE311C4 anonymous strike <strike.devtest@gmail.com>\n" +
        "[GNUPG:] NEED_PASSPHRASE 781617319CE311C4 781617319CE311C4 1 0\n" +
        "gpg-agent[14654]: command get_passphrase failed: Operation cancelled\n" +
        "gpg: cancelled by user\n" +
        "[GNUPG:] MISSING_PASSPHRASE\n" +
        "gpg: skipped \"<strike.devtest@gmail.com>\": Operation cancelled\n" +
        "[GNUPG:] INV_SGNR 0 <strike.devtest@gmail.com>\n" +
        "gpg: [stdin]: clearsign failed: Operation cancelled\n";

    EnigmailCommon.parseErrorOutput(errorOutput, retStatusObj = {});
    Assert.assertContains(retStatusObj.statusMsg,"Missing Passphrase");
    Assert.equal(retStatusObj.extendedStatus, "");
}

Assert.assertContains = function(actual, expected, message) {
    var msg = message || "Searching for <".concat(expected)
      .concat("> to be contained within ")
      .concat("<").concat(actual).concat(">");
    Assert.equal(actual.search(expected) > -1, true, msg);
};
