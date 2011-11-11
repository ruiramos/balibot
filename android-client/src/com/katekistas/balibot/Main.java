package com.katekistas.balibot;

import android.app.Activity;
import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Bundle;
import android.os.Vibrator;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

public class Main extends Activity implements SensorEventListener {
	private static final String TAG = "Main";
	
	public static final int POSITION_LEFT = 0;
	public static final int POSITION_CENTER = 1;
	public static final int POSITION_RIGHT = 2;
	private int lastPos = POSITION_CENTER;
	
	private SensorManager mSensorManager;
	private Sensor mAccelerometer;
	
	private Client client = new Client(this);
	
	private static int CONTROL_AXIS = SensorManager.AXIS_Y;
	private static int TRESHOLD = 3;
	
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.main);
		mSensorManager = (SensorManager) getSystemService(SENSOR_SERVICE);
    mAccelerometer = mSensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
    client.setName("Rikas");
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
		TextView direction = (TextView) findViewById(R.id.direction);
		if (value>TRESHOLD && lastPos != POSITION_RIGHT) {
			lastPos = POSITION_RIGHT;
			direction.setText("DIREITA! >>>> ");
			client.sendTurn(POSITION_RIGHT);
		} else if (value<(0-TRESHOLD) && lastPos != POSITION_LEFT) {
			lastPos = POSITION_LEFT;
			direction.setText("<<<< ESQUERDA!");
			client.sendTurn(POSITION_LEFT);
		} else if (lastPos != POSITION_CENTER && ((0-TRESHOLD)<=value) && (value<=TRESHOLD)){
			lastPos = POSITION_CENTER;
			direction.setText("PARADO");
			client.sendTurn(POSITION_CENTER);
		}
	}
	
	public void _connect(View view) {
		Button connect = (Button) findViewById(R.id.connect);
		// Already connected -> Disconnect
		if (client.isConnected()) {
			connect.setText("Connect");
			client.disconnect();
		} else {
			if (client.connect("192.168.1.87", 9090)) {
				Vibrator vibrator =(Vibrator)getSystemService(Context.VIBRATOR_SERVICE);
        vibrator.vibrate(400);
				connect.setText("Disconnect");
			}
		}
	}
}