package com.katekistas.balibot;

import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.net.Socket;
import java.net.UnknownHostException;

import android.content.Context;
import android.telephony.TelephonyManager;
import android.util.Log;

public class Client {
	private final static String TAG = "Client";
	
	private boolean connected = false;
	private Socket socket = null;
	private Thread receiverThread;
	private String name;
	
	private DataOutputStream output;
	private DataInputStream input;
	
	private Context mContext;
	private static Client instance = null;
	
	private static final String TYPE_COLOR = "color";
	
	public static Client getInstance() {
		if (instance == null) {
			instance = new Client();
		}
		return instance;
	}
	
	public void setContext(Context context) {
		this.mContext = context;
	}
	
	public boolean connect(String ip, int port) {
		// TODO: throw exception se ja estiver connected
		connected = false;
		try {
			socket = new Socket(ip, port);
			output = new DataOutputStream(socket.getOutputStream());
			input = new DataInputStream(socket.getInputStream());
			output.writeBytes("id:"+getIMEI()+":"+name);
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
		case Game.POSITION_LEFT:
			turnLeft();
			break;
		case Game.POSITION_RIGHT:
			turnRight();
			break;
		case Game.POSITION_CENTER:
			stopTurn();
			break;
		}
	}
	
	public void receive(final Game game) {
		receiverThread = new Thread(new Runnable() {
      public void run() {
        while (!Thread.interrupted()) {
          try {
            final String data = input.readLine();
            if (!isConnected()) {
            	Thread.currentThread().interrupt();
            }
            // Received DATA
            if (data != null) {
            	game.onReceive(data);
            }
          } catch (IOException e) { e.printStackTrace();}
        }
      }
    });
		receiverThread.start();
	}
	
	private void turnLeft() {
		try {
			output.writeBytes("pos:"+Game.POSITION_LEFT);
		} catch (IOException e) {
			e.printStackTrace();
			disconnect();
		}
	}
	
	private void turnRight() {
		try {
			output.writeBytes("pos:"+Game.POSITION_RIGHT);
		} catch (IOException e) {
			e.printStackTrace();
			disconnect();
		}
	}
	
	private void stopTurn() {
		try {
			output.writeBytes("pos:"+Game.POSITION_CENTER);
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
