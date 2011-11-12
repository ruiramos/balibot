package com.katekistas.balibot;

import android.app.Activity;

import android.graphics.Color;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;

public class Game extends Activity implements SensorEventListener {
	private static final String TAG = "Game";
	
	private Side currentSide = null;
  private Side oldSide = null;
  private float azimuth;
  private float pitch;
  private float roll;
	
	/** Sides of the phone */
  enum Side {
      TOP,
      BOTTOM,
  }
	
	public static final int POSITION_LEFT = -1;
	public static final int POSITION_CENTER = 0;
	public static final int POSITION_RIGHT = 1;
	private int lastPos = POSITION_CENTER;
	
	private static int CONTROL_AXIS = SensorManager.AXIS_Y;
	private static float TRESHOLD = 4.0f;
	
	private Client client = Client.getInstance();
	
	private SensorManager mSensorManager;
	private Sensor mAccelerometer;
	
	ImageView left;
	ImageView right;

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.game);
		mSensorManager = (SensorManager)getSystemService(SENSOR_SERVICE);
    mAccelerometer = mSensorManager.getDefaultSensor(Sensor.TYPE_ORIENTATION);
    
    left = (ImageView)findViewById(R.id.left_arrow_image);
    left.setAlpha(50);
    
    right = (ImageView)findViewById(R.id.right_arrow_image);
    right.setAlpha(50);
    
    // Start receiving messages
		client.receive(this);
	}
	
	protected void onResume() {
  	super.onResume();
    mSensorManager.registerListener(this, mAccelerometer, SensorManager.SENSOR_DELAY_GAME);
  }
  
  protected void onPause() {
  	super.onPause();
  	mSensorManager.unregisterListener(this);
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
		
		pitch = event.values[1];
		
		if (pitch<-13 && lastPos != POSITION_RIGHT) {
			lastPos = POSITION_RIGHT;
			client.sendTurn(POSITION_RIGHT);
		} else if (pitch > 13 && lastPos != POSITION_LEFT) {
			lastPos = POSITION_LEFT;
			client.sendTurn(POSITION_LEFT);
		} else if (lastPos != POSITION_CENTER && (pitch>=-13 && pitch<=13)) {
			lastPos = POSITION_CENTER;
			client.sendTurn(POSITION_CENTER);
		}
		
		/*
		float value = event.values[CONTROL_AXIS-1];
		if (value>TRESHOLD && lastPos != POSITION_RIGHT) {
			lastPos = POSITION_RIGHT;
			client.sendTurn(POSITION_RIGHT);
			right.setAlpha(100);
		} else if (value<(0-TRESHOLD) && lastPos != POSITION_LEFT) {
			lastPos = POSITION_LEFT;
			left.setAlpha(100);
			client.sendTurn(POSITION_LEFT);
		} else if (lastPos != POSITION_CENTER && ((0-TRESHOLD)<=value) && (value<=TRESHOLD)){
			lastPos = POSITION_CENTER;
			client.sendTurn(POSITION_CENTER);
			right.setAlpha(50);
			left.setAlpha(50);
		}*/
	}
	
	public void onReceive(String data) {
		Log.d(TAG, "received: "+data);
		String[] msg = data.split(":");
		String type = msg[0];
		if (type.equalsIgnoreCase("color")) {
			String color = msg[1];
			LinearLayout mlayout= (LinearLayout)this.findViewById(R.id.game_layout);
			mlayout.setBackgroundColor(Color.parseColor(color));
		}
	}
}
