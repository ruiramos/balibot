package com.katekistas.balibot;

import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.net.Socket;
import java.net.UnknownHostException;

import android.content.Context;
import android.os.Handler;
import android.os.Message;
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
	
	public String getName() {
		return name;
	}
	
	public void sendTurn(float direction) {
		try {
			output.writeBytes("pos:"+direction+":"+getIMEI());
		} catch (IOException e) {
			e.printStackTrace();
			disconnect();
		}
	}
	
	public void sendStart() {
		try {
			output.writeBytes("go:"+getIMEI());
		} catch (IOException e) {
			e.printStackTrace();
			disconnect();
		}
	}
	
	public void receive(final Handler mHandler) {
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
            	Message msg = new Message();
              msg.obj = data;
              mHandler.sendMessage(msg);
            }
          } catch (IOException e) {
          	Thread.currentThread().interrupt();
          	e.printStackTrace();
          }
        }
      }
    });
		receiverThread.start();
	}
	
	private String getIMEI() {
		TelephonyManager telephonyManager = (TelephonyManager)mContext.getSystemService(Context.TELEPHONY_SERVICE);
		return telephonyManager.getDeviceId();
	}
}
