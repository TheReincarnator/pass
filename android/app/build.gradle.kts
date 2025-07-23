plugins {
	alias(libs.plugins.android.application)
	alias(libs.plugins.kotlin.android)
}

android {
	namespace = "de.thomasjacob.pass"
	compileSdk = 34

	defaultConfig {
		applicationId = "de.thomasjacob.pass"
		minSdk = 24
		targetSdk = 34
		versionCode = 2
		versionName = "1.0.1"

		testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
		vectorDrawables {
			useSupportLibrary = true
		}
	}

	buildTypes {
		release {
			isMinifyEnabled = false
			proguardFiles(
				getDefaultProguardFile("proguard-android-optimize.txt"),
				"proguard-rules.pro"
			)
			buildConfigField("String", "BUILD_VARIANT", "\"release\"")
			buildConfigField("String", "PWA_URL", "\"https://pass.thomasjacob.de/\"")
			buildConfigField("Boolean", "IGNORE_GEO_GATING", "false")
			buildConfigField("Boolean", "ALLOW_INVALID_CERT", "false")
			signingConfig = signingConfigs.getByName("debug")
		}
		debug {
			buildConfigField("String", "BUILD_VARIANT", "\"debug\"")
			buildConfigField("String", "PWA_URL", "\"https://pass.thomasjacob.de/\"")
			buildConfigField("Boolean", "IGNORE_GEO_GATING", "true")
			buildConfigField("Boolean", "ALLOW_INVALID_CERT", "false")
		}
		create("emulator_testing") {
			initWith(getByName("debug"))
			buildConfigField("String", "BUILD_VARIANT", "\"emulator_testing\"")
			buildConfigField("String", "PWA_URL", "\"https://10.0.2.2:3001\"")
			buildConfigField("Boolean", "IGNORE_GEO_GATING", "true")
			buildConfigField("Boolean", "ALLOW_INVALID_CERT", "true")
		}
	}
	compileOptions {
		sourceCompatibility = JavaVersion.VERSION_1_8
		targetCompatibility = JavaVersion.VERSION_1_8
	}
	kotlinOptions {
		jvmTarget = "1.8"
	}
	buildFeatures {
		compose = true
		android.buildFeatures.buildConfig = true
	}
	composeOptions {
		kotlinCompilerExtensionVersion = "1.5.1"
	}
	packaging {
		resources {
			excludes += "/META-INF/{AL2.0,LGPL2.1}"
		}
	}
}

dependencies {

	implementation(libs.androidx.core.ktx)
	implementation(libs.androidx.lifecycle.runtime.ktx)
	implementation(libs.androidx.activity.compose)
	implementation(platform(libs.androidx.compose.bom))
	implementation(libs.androidx.ui)
	implementation(libs.androidx.ui.graphics)
	implementation(libs.androidx.ui.tooling.preview)
	implementation(libs.androidx.material3)
	testImplementation(libs.junit)
	androidTestImplementation(libs.androidx.junit)
	androidTestImplementation(libs.androidx.espresso.core)
	androidTestImplementation(platform(libs.androidx.compose.bom))
	androidTestImplementation(libs.androidx.ui.test.junit4)
	debugImplementation(libs.androidx.ui.tooling)
	debugImplementation(libs.androidx.ui.test.manifest)
}