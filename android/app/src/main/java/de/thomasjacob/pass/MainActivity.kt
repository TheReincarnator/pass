package de.thomasjacob.pass

import android.annotation.SuppressLint
import android.app.AlertDialog
import android.content.DialogInterface
import android.content.Intent
import android.net.Uri
import android.net.http.SslError
import android.os.Bundle
import android.telephony.TelephonyManager
import android.webkit.HttpAuthHandler
import android.webkit.SslErrorHandler
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import de.thomasjacob.pass.ui.theme.PassTheme
import androidx.core.net.toUri

class MainActivity : ComponentActivity() {

	override fun onCreate(savedInstanceState: Bundle?) {
		super.onCreate(savedInstanceState)
		enableEdgeToEdge()

		val telephonyManager: TelephonyManager =
			(getSystemService(TELEPHONY_SERVICE) as TelephonyManager);
		val isoCode = telephonyManager.networkCountryIso

		val isInGermany = isoCode.equals("de")
		WebView.setWebContentsDebuggingEnabled(true)

		setContent {
			PassTheme {
				Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
					if (BuildConfig.IGNORE_GEO_GATING || isInGermany) {
						PwaWebView(
							modifier = Modifier.padding(innerPadding)
						)
					} else {
						AppNotAvailableScreen(
							isoCode = isoCode,
							onClose = {
								finishAffinity()
							}
						)
					}
				}
			}
		}
	}
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun PwaWebView(modifier: Modifier) {
	AndroidView(
		factory = { context ->
			WebView(
				context,
			).apply {
				loadUrl(
					BuildConfig.PWA_URL,
				)

				val pwaHost = BuildConfig.PWA_URL.toUri().host
				webViewClient = object : WebViewClient() {
					override fun shouldInterceptRequest(view: WebView?, request: WebResourceRequest?): WebResourceResponse? {
						if (request?.url == null || request.url.host != pwaHost) {
							return super.shouldInterceptRequest(view, request)
						}

						Intent(Intent.ACTION_VIEW, request.url)
						return null
					}

					override fun onReceivedSslError(
						view: WebView,
						handler: SslErrorHandler,
						error: SslError,
					) {
						if (!BuildConfig.ALLOW_INVALID_CERT) {
							handler.cancel()
							return
						}
						val builder = AlertDialog.Builder(context)
						val alertDialog = builder.create()
						var message = "SSL Certificate error."
						when (error.primaryError) {
							SslError.SSL_UNTRUSTED -> message =
								"The certificate authority is not trusted."

							SslError.SSL_EXPIRED -> message = "The certificate has expired."
							SslError.SSL_IDMISMATCH -> message =
								"The certificate Hostname mismatch."

							SslError.SSL_NOTYETVALID -> message =
								"The certificate is not yet valid."
						}

						message += " Do you want to continue anyway?"
						alertDialog.setTitle("SSL Certificate Error")
						alertDialog.setMessage(message)
						alertDialog.setButton(
							DialogInterface.BUTTON_POSITIVE, "OK"
						) { dialog, which -> // Ignore SSL certificate errors
							handler.proceed()
						}

						alertDialog.setButton(
							DialogInterface.BUTTON_NEGATIVE, "Cancel"
						) { dialog, which -> handler.cancel() }
						alertDialog.show()
					}
				}

				settings.useWideViewPort = true
				settings.domStorageEnabled = true
				settings.setSupportZoom(false)
				settings.javaScriptEnabled = true
				settings.databaseEnabled = true
				settings.cacheMode = android.webkit.WebSettings.LOAD_DEFAULT
			}
		},
		modifier
	)
}

@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
	PassTheme {
		PwaWebView(
			Modifier.padding()
		)
	}
}

@Composable
fun AppNotAvailableScreen(isoCode: String, onClose: () -> Unit) {
	Surface(
		modifier = Modifier
			.fillMaxSize()
			.padding(16.dp),
		color = Color.White
	) {
		Column(
			modifier = Modifier
				.fillMaxSize()
				.padding(16.dp),
			verticalArrangement = Arrangement.Center,
			horizontalAlignment = Alignment.CenterHorizontally
		) {
			// App Logo
			Image(
				painter = painterResource(id = R.drawable.pass),
				contentDescription = stringResource(R.string.app_logo),
				modifier = Modifier
					.size(100.dp)
					.padding(bottom = 24.dp)
			)

			// Title Text
			Text(
				text = stringResource(R.string.app_unavailable_title),
				fontSize = 18.sp,
				fontWeight = FontWeight.Bold,
				color = Color.Black,
				style = TextStyle(textAlign = TextAlign.Center),
				modifier = Modifier.padding(bottom = 6.dp)
			)

			// Message Text
			Text(
				text = stringResource(R.string.app_unavailable_message),
				fontSize = 16.sp,
				color = Color.Gray,
				modifier = Modifier.padding(bottom = 12.dp),
				style = TextStyle(textAlign = TextAlign.Center),
				lineHeight = 20.sp
			)

			Text(
				text = stringResource(R.string.app_unavailable_country) + ": " + isoCode,
				color = Color.Gray,
				fontSize = 12.sp,
				modifier = Modifier.padding(bottom = 12.dp),
			)

			// Close Button
			Button(
				onClick = {
					onClose()
				},
				colors = ButtonDefaults.buttonColors(
					containerColor = Color.Black
				),
			) {
				Text(
					text = stringResource(R.string.close_button),
					color = Color.White
				)
			}
		}
	}
}
