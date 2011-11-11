package com.katekistas.balibot;

import java.io.DataOutputStream;
import java.io.IOException;
import java.net.Socket;
import java.net.UnknownHostException;

import android.content.Context;
import android.telephony.TelephonyManager;

public class Client {	
	private boolean connected = false;
	private Socket socket = null;
	private String name;
	
	private DataOutputStream output;
	
	private Context mContext;
	
	public Client(Context context) {
		this.mContext = context;
	}
	
	public boolean connect(String ip, int port) {
		// TODO: throw exception se ja estiver connected
		connected = false;
		try {
			socket = new Socket(ip, port);
			output = new DataOutputStream(socket.getOutputStream());
			output.writeChars("id:"+getIMEI()+":"+name);
			connected = true;
		} catch (UnknownHostException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return connected;
	}
	
	public boolean isConnected() {
		return connected;
	}
	
	public void disconnect() {
		try {
			socket.close();
			connected = false;
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public void sendTurn(int direction) {
		switch(direction) {
		case Main.POSITION_LEFT:
			turnLeft();
			break;
		case Main.POSITION_RIGHT:
			turnRight();
			break;
		case Main.POSITION_CENTER:
			stopTurn();
			break;
		}
	}
	
	private void turnLeft() {
		try {
			output.writeChars("position:"+Main.POSITION_LEFT);
		} catch (IOException e) {
			e.printStackTrace();
			disconnect();
		}
	}
	
	private void turnRight() {
		try {
			output.writeChars("position:"+Main.POSITION_RIGHT);
		} catch (IOException e) {
			e.printStackTrace();
			disconnect();
		}
	}
	
	private void stopTurn() {
		try {
			output.writeChars("position:"+Main.POSITION_CENTER);
		} catch (IOException e) {
			e.printStackTrace();
			disconnect();
		}
	}
	
	private String getIMEI() {
		TelephonyManager telephonyManager = (TelephonyManager)mContext.getSystemService(Context.TELEPHONY_SERVICE);
		return telephonyManager.getDeviceId();
	}
}
