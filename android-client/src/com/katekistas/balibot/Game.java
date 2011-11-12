package com.katekistas.balibot;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;

import android.app.Activity;
import android.content.Context;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.Typeface;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.os.PowerManager;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.RadioButton;
import android.widget.TextView;

public class Game extends Activity implements SensorEventListener {
	private static final String TAG = "Game";
	
	public static final float POSITION_LEFT4 = -1;
	public static final float POSITION_LEFT3 = -0.8f;
	public static final float POSITION_LEFT2 = -0.5f;
	public static final float POSITION_LEFT1 = -0.2f;
	public static final float POSITION_CENTER = 0;
	public static final float POSITION_RIGHT1 = 0.2f;
	public static final float POSITION_RIGHT2 = 0.5f;
	public static final float POSITION_RIGHT3 = 0.8f;
	public static final float POSITION_RIGHT4 = 1;
	
	private float lastPos = POSITION_CENTER;
	
	private static int CONTROL_AXIS = SensorManager.AXIS_Y;
	
	private static float TRESHOLD1 = 11;
	private static float TRESHOLD2 = 16;
	private static float TRESHOLD3 = 21;
	private static float TRESHOLD4 = 26;
	
	private Client client = Client.getInstance();
	
	private SensorManager mSensorManager;
	private Sensor mAccelerometer;
	
	ImageView left;
	ImageView right;
	
	private PowerManager.WakeLock wl;
	
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.game);
		mSensorManager = (SensorManager)getSystemService(SENSOR_SERVICE);
    mAccelerometer = mSensorManager.getDefaultSensor(Sensor.TYPE_ORIENTATION);
    
    // Prevent sleep
    PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
    wl = pm.newWakeLock(PowerManager.SCREEN_DIM_WAKE_LOCK, "katekistas");
    wl.acquire();
    
    Typeface tf = Typeface.createFromAsset(getAssets(), "commodore.ttf");
    TextView name = (TextView)findViewById(R.id.name_text);
    name.setIncludeFontPadding(false);
    name.setLineSpacing(0.0f, 1f);
		name.setTypeface(tf);
    name.setText(client.getName());
    
    left = (ImageView)findViewById(R.id.left_arrow_image);
    left.setAlpha(50);
    
    right = (ImageView)findViewById(R.id.right_arrow_image);
    right.setAlpha(50);
    
		Handler mHandler = new Handler() {
			@Override
			public void handleMessage(Message msg) {
				String text = (String) msg.obj;
				onReceive(text);
	    }
		};
		
    // Start receiving messages
		client.receive(mHandler);
	}
	
	protected void onResume() {
  	super.onResume();
    mSensorManager.registerListener(this, mAccelerometer, SensorManager.SENSOR_DELAY_GAME);
  }
  
  protected void onPause() {
  	super.onPause();
  	mSensorManager.unregisterListener(this);
  	wl.release();
  }
	
	@Override
	public void onAccuracyChanged(Sensor arg0, int arg1) {}

	@Override
	public void onSensorChanged(SensorEvent event) {
		if (!client.isConnected()) {
			Button connect = (Button) findViewById(R.id.connect);
			if (connect.getText().equals("Disconnect")) {
				connect.setText("Connect");
			}
			return;
		}
		
		float pitch = event.values[CONTROL_AXIS-1];
		
		if (pitch>TRESHOLD1 && pitch<TRESHOLD2 && lastPos != POSITION_LEFT1) {
			lastPos = POSITION_LEFT1;
			client.sendTurn(POSITION_LEFT1);
		} else if (pitch>TRESHOLD2 && pitch<TRESHOLD3 && lastPos != POSITION_LEFT2) {
			lastPos = POSITION_LEFT2;
			client.sendTurn(POSITION_LEFT2);
		} else if (pitch>TRESHOLD3 && lastPos != POSITION_LEFT3) {
			lastPos = POSITION_LEFT3;
			client.sendTurn(POSITION_LEFT3);
		} else if (pitch>TRESHOLD4 && lastPos != POSITION_LEFT4) {
			lastPos = POSITION_LEFT4;
			client.sendTurn(POSITION_LEFT4);
		} else if (pitch<-TRESHOLD1 && pitch>-TRESHOLD2 && lastPos != POSITION_RIGHT1) {
			lastPos = POSITION_RIGHT1;
			client.sendTurn(POSITION_RIGHT1);
		} else if (pitch<-TRESHOLD2 && pitch>-TRESHOLD3 && lastPos != POSITION_RIGHT2) {
			lastPos = POSITION_RIGHT2;
			client.sendTurn(POSITION_RIGHT2);
		} else if (pitch<-TRESHOLD3 && lastPos != POSITION_RIGHT3) {
			lastPos = POSITION_RIGHT3;
			client.sendTurn(POSITION_RIGHT3);
		} else if (pitch<-TRESHOLD4 && lastPos != POSITION_RIGHT4) {
			lastPos = POSITION_RIGHT4;
			client.sendTurn(POSITION_RIGHT4);
		} else if (pitch<TRESHOLD1 && pitch>-TRESHOLD1 && lastPos != POSITION_CENTER) {
			lastPos = POSITION_CENTER;
			client.sendTurn(POSITION_CENTER);
		}
		
		if (lastPos == POSITION_RIGHT1 || lastPos == POSITION_RIGHT2 || lastPos == POSITION_RIGHT3 || lastPos == POSITION_RIGHT4) {
			right.setAlpha(100);
		}
		
		else if (lastPos == POSITION_LEFT1 || lastPos == POSITION_LEFT2 || lastPos == POSITION_LEFT3 || lastPos == POSITION_LEFT4) {
			left.setAlpha(100);
		} else {
			left.setAlpha(50);
			right.setAlpha(50);
		}
		
		/*if (pitch<-TRESHOLD && lastPos != POSITION_RIGHT) {
			lastPos = POSITION_RIGHT;
			client.sendTurn(POSITION_RIGHT);
			right.setAlpha(100);
		} else if (pitch > TRESHOLD && lastPos != POSITION_LEFT) {
			lastPos = POSITION_LEFT;
			client.sendTurn(POSITION_LEFT);
			left.setAlpha(100);
		} else if (lastPos != POSITION_CENTER && (pitch>=-TRESHOLD && pitch<=TRESHOLD)) {
			lastPos = POSITION_CENTER;
			client.sendTurn(POSITION_CENTER);
			right.setAlpha(50);
			left.setAlpha(50);
		}*/
	}
	
	public void _startGame(View view) {
		if (client.isConnected()) {
			client.sendStart();
			Button start = (Button)findViewById(R.id.start_button);
			//start.setEnabled(false);
		}
	}
	
	public void onReceive(String data) {
		Log.d(TAG, "received: "+data);
		String[] msg = data.split(":");
		String type = msg[0];
		if (type.equalsIgnoreCase("color")) {
			String color = msg[1];
			LinearLayout mlayout = (LinearLayout)this.findViewById(R.id.game_layout);
			mlayout.setBackgroundColor(Color.parseColor(color));
		} else if (type.equalsIgnoreCase("bot")) {
			//Bitmap bot = getBot(msg[1]);
			//ImageView botView = (ImageView)this.findViewById(R.id.bot);
			//botView.setImageBitmap(bot);
		}
	}
	
	private Bitmap getBot(String botURL) {
		Bitmap bot = null;
		URL imageURL = null;
		try {
			Log.d(TAG, "BOT URL: "+"https://codebits.eu"+botURL);
			imageURL = new URL("https://codebits.eu"+botURL);
		} catch (MalformedURLException e) {
			e.printStackTrace();
		}
		try {
			HttpURLConnection conn = (HttpURLConnection) imageURL.openConnection();
			conn.setDoInput(true);
			conn.connect();
			InputStream is = conn.getInputStream();
			bot = BitmapFactory.decodeStream(is);
		} catch(IOException ioe) {
			ioe.printStackTrace();
		}
		return bot;
	}
}
