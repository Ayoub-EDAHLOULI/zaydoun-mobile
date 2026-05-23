/**
 * Expo config plugin that patches @react-native-voice/voice's outdated
 * build.gradle at EAS build time.
 *
 * Problems fixed:
 *  1. jcenter() is dead — replaced with mavenCentral()
 *  2. Missing compileSdk — added namespace + compileSdk 36
 *  3. Old com.android.support library — replaced with AndroidX equivalent
 *  4. Outdated buildscript/allprojects blocks — removed (handled by root project)
 */

const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const fixedBuildGradle = `apply plugin: 'com.android.library'

android {
    namespace "com.wenkesj.voice"
    compileSdk 36

    defaultConfig {
        minSdkVersion 24
        targetSdkVersion 36
        versionCode 1
        versionName "1.0"
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}

repositories {
    mavenCentral()
    maven {
        url "$projectDir/../node_modules/react-native/android"
    }
}

dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.facebook.react:react-native:+'
}
`;

module.exports = function withVoiceFix(config) {
  return withDangerousMod(config, [
    "android",
    (config) => {
      const buildGradlePath = path.join(
        config.modRequest.projectRoot,
        "node_modules",
        "@react-native-voice",
        "voice",
        "android",
        "build.gradle",
      );

      if (fs.existsSync(buildGradlePath)) {
        fs.writeFileSync(buildGradlePath, fixedBuildGradle, "utf8");
        console.log(
          "✅ [withVoiceFix] Patched @react-native-voice/voice/android/build.gradle",
        );
      } else {
        console.warn(
          "⚠️  [withVoiceFix] build.gradle not found at expected path:",
          buildGradlePath,
        );
      }

      return config;
    },
  ]);
};
