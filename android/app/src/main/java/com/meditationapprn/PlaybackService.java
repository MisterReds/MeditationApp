// /root/development/MeditationAppRN/android/app/src/main/java/com/meditationapprn/PlaybackService.java

package com.meditationapprn; // <-- ПРАВИЛЬНЫЙ ПАКЕТ!

import android.content.Intent;
import android.os.Bundle;
import androidx.annotation.Nullable;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;

public class PlaybackService extends HeadlessJsTaskService {

    @Nullable
    @Override
    protected HeadlessJsTaskConfig getTaskConfig(Intent intent) {
        Bundle extras = intent.getExtras();
        if (extras != null) {
            return new HeadlessJsTaskConfig(
                "TrackPlayer",
                Arguments.fromBundle(extras),
                5000,
                true
            );
        }
        return null;
    }
}