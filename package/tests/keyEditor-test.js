/*global do_load_module: false, do_get_file: false, do_get_cwd: false, testing: false, test: false, Assert: false, resetting: false, JSUnit: false, do_test_pending: false, do_test_finished: false, withTestGpgHome:false */
/*global Ec: false, Cc: false, Ci: false, do_print: false, EnigmailCore: false, KeyEditor: false, EnigmailCommon: false, Components: false, component: false, Prefs: false, Execution: false */
/*jshint -W097 */
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "MPL"); you may not use this file
 * except in compliance with the MPL. You may obtain a copy of
 * the MPL at http://www.mozilla.org/MPL/
 *
 * Software distributed under the MPL is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the MPL for the specific language governing
 * rights and limitations under the MPL.
 *
 * The Original Code is Enigmail.
 *
 * The Initial Developer of the Original Code is Patrick Brunschwig.
 * Portions created by Patrick Brunschwig <patrick@enigmail.net> are
 * Copyright (C) 2010 Patrick Brunschwig. All Rights Reserved.
 *
 * Contributor(s):
 *  Fan Jiang <fanjiang@thoughtworks.com>
 *  Iván Pazmiño <iapamino@thoughtworks.com>
 *  Ola Bini <obini@thoughtworks.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 * ***** END LICENSE BLOCK ***** */

"use strict";

do_load_module("file://" + do_get_cwd().path + "/testHelper.js");

testing("keyEditor.jsm"); /*global editKey: false */
component("enigmail/prefs.jsm");
component("enigmail/keyRing.jsm"); /*global KeyRing: false */
component("enigmail/enigmailCore.jsm");
component("enigmail/enigmailCommon.jsm");
component("enigmail/execution.jsm");
component("enigmail/enigmailGpgAgent.jsm"); /*global EnigmailGpgAgent: false */
component("enigmail/gpg.jsm"); /*global Gpg: false */

test(withTestGpgHome(importKeyForEdit));
test(withTestGpgHome(shouldExecCmd));
test(withTestGpgHome(shouldEditKey));
test(withTestGpgHome(shouldSetTrust));
test(withTestGpgHome(shouldSignKey));

function shouldExecCmd() {
    var window = JSUnit.createStubWindow();
    var enigmailSvc = Ec.getService(window);
    var command= EnigmailGpgAgent.agentPath;

    var args = Gpg.getStandardArgs(false);
    args=args.concat(["--no-tty", "--status-fd", "1", "--logger-fd", "1", "--command-fd", "0"]);
    args=args.concat(["--list-packets", "resources/dev-strike.asc"]);
    var output = "";
    Execution.execCmd2(command, args,
        function (pipe) {
            //Assert.equal(stdin, 0);
        },
        function (stdout) {
            output+=stdout;
        },
        function (result) {
            Assert.deepEqual(result, {"exitCode":0,"stdout":"","stderr":""});
        }
    );
    do_print(output);
    Assert.assertContains(output,":public key packet:");
    Assert.assertContains(output,":user ID packet:");
    Assert.assertContains(output,":signature packet:");
    Assert.assertContains(output,":public sub key packet:");
    Assert.assertContains(output,":signature packet:");
    Assert.assertContains(output,":secret key packet:");
}

function shouldEditKey() {
    importKeyForEdit();
    do_test_pending();
    var window = JSUnit.createStubWindow();
    editKey(
        window,
        false,
        null,
        "781617319CE311C4",
        "trust",
        {trustLevel: 5},
        function (inputData, keyEdit, ret) {
            ret.writeTxt = "";
            ret.errorMsg = "";
            ret.quitNow=true;
            ret.exitCode=0;
        },
        null,
        function (exitCode, errorMsg) {
            Assert.equal(exitCode, 0);
            Assert.equal("", errorMsg);
            do_test_finished();
        }
    );
}

function shouldSetTrust() {
    importKeyForEdit();
    do_test_pending();
    var window = JSUnit.createStubWindow();
    KeyEditor.setKeyTrust(window,
        "781617319CE311C4",
        5,
        function (exitCode, errorMsg) {
            Assert.equal(exitCode, 0);
            Assert.equal("", errorMsg);
            do_test_finished();
        }
    );
}

function shouldSignKey() {
    importKeyForEdit();
    do_test_pending();
    var window = JSUnit.createStubWindow();
    KeyEditor.signKey(window,
        "anonymous strike <strike.devtest@gmail.com>",
        "781617319CE311C4",
        false,
        5,
        function (exitCode, errorMsg) {
            Assert.equal(exitCode, 0);
            Assert.equal("The key is already signed, you cannot sign it twice.",errorMsg);
            do_test_finished();
        }
    );
}

function importKeyForEdit() {
    initializeEnigmail();
    var window = JSUnit.createStubWindow();
    var publicKey = do_get_file("resources/dev-strike.asc", false);
    var errorMsgObj = {};
    var importedKeysObj = {};
    var importResult = KeyRing.importKeyFromFile(window, publicKey, errorMsgObj, importedKeysObj);
    Assert.equal(importResult, 0);
}

function initializeEnigmail() {
    var enigmail = Cc["@mozdev.org/enigmail/enigmail;1"].createInstance(Ci.nsIEnigmail);
    var window = JSUnit.createStubWindow();
    enigmail.initialize(window, "");
    return enigmail;
}