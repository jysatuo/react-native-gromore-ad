package com.skylantern.gromoread;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import android.util.Log;

public class GroMorePackage implements ReactPackage {
    private static final String TAG = "GroMorePackage";

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        Log.d(TAG, "createViewManagers called");
        return Collections.emptyList();
    }

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        Log.d(TAG, "createNativeModules called");
        List<NativeModule> modules = new ArrayList<>();
        GroMoreModule groMoreModule = new GroMoreModule(reactContext);
        modules.add(groMoreModule);
        Log.d(TAG, "GroMoreModule created and added to modules list");
        Log.d(TAG, "Module name: " + groMoreModule.getName());
        return modules;
    }
}
