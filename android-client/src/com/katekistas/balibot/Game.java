package com.katekistas.balibot;

import android.app.Activity;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Bundle;
import android.widget.Button;

public class Game extends Activity implements SensorEventListener {
	public static final int POSITION_LEFT = 0;
	public static final int POSITION_CENTER = 1;
	public static final int POSITION_RIGHT = 2;
	private int lastPos = POSITION_CENTER;
	
	private static int CONTROL_AXIS = SensorManager.AXIS_Y;
	private static int TRESHOLD = 3;
	
	private Client client = Client.getInstance();
	
	private SensorManager mSensorManager;
	private Sensor mAccelerometer;

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.game);
	}
	
	protected void onResume() {
  	super.onResume();
    mSensorManager.registerListener(this, mAccelerometer, SensorManager.SENSOR_DELAY_NORMAL);
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
		
		float value = event.values[CONTROL_AXIS-1];
		if (value>TRESHOLD && lastPos != POSITION_RIGHT) {
			lastPos = POSITION_RIGHT;
			client.sendTurn(POSITION_RIGHT);
		} else if (value<(0-TRESHOLD) && lastPos != POSITION_LEFT) {
			lastPos = POSITION_LEFT;
			client.sendTurn(POSITION_LEFT);
		} else if (lastPos != POSITION_CENTER && ((0-TRESHOLD)<=value) && (value<=TRESHOLD)){
			lastPos = POSITION_CENTER;
			client.sendTurn(POSITION_CENTER);
		}
	}
}
