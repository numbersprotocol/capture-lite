package io.numbersprotocol.capturelite;

import android.os.Build;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import java.util.ArrayList;
import android.content.res.Configuration;
import android.webkit.WebSettings;

public class MainActivity extends BridgeActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    forceWebViewDarkMode();
  }

  private void forceWebViewDarkMode() {
    // WORKAROUND: Some Android devices have white flash during iframe load, and navigation
    // since capture app heavily relies on bubble app that runs inside iframe it's important
    // to prevent white flash. Another thing is capture app has dark theme only so we are safe to
    // forcefully set capacitor's WebView to Dark
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      this.getBridge().getWebView().getSettings().setForceDark(WebSettings.FORCE_DARK_ON);
    }
  }

  void setDarkMode() {
    // WORKAROUND: Android device doesn't support media query for prefers-color-scheme
    // @reference: https://github.com/ionic-team/capacitor/discussions/1978#discussioncomment-708439
    final int nightModeFlags = getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;
    WebSettings webSettings = this.bridge.getWebView().getSettings();
    String darkMode = " AndroidDarkMode";
    if (nightModeFlags == Configuration.UI_MODE_NIGHT_YES) {
      String userAgent = webSettings.getUserAgentString();
      if (!userAgent.contains(darkMode)) {
        userAgent = userAgent + darkMode;
        webSettings.setUserAgentString(userAgent);
      }
    } else {
      String userAgent = webSettings.getUserAgentString();
      if (userAgent.contains(darkMode)) {
        userAgent = userAgent.replace(darkMode, "");
        webSettings.setUserAgentString(userAgent);
      }
    }
  }

  @Override
  public void onResume() {
    super.onResume();
    // setDarkMode();
  }
}
