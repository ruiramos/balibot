package com.katekistas.balibot;

import java.io.IOException;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.ArrayList;
import java.util.Enumeration;

import javax.jmdns.JmDNS;
import javax.jmdns.ServiceInfo;
import javax.jmdns.ServiceListener;
import javax.jmdns.ServiceEvent;
import javax.jmdns.impl.JmDNSImpl;

import android.app.Activity;
import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.net.wifi.WifiManager;
import android.net.wifi.WifiManager.MulticastLock;
import android.os.Bundle;
import android.os.Vibrator;
import android.util.Log;
import android.view.View;
import android.widget.Button;

public class Main extends Activity {
	JmDNS jmdns;
	JmDNSImpl impl;
	public ArrayList<String> deviceList;
	MulticastLock lock;
	protected ServiceListener listener;

	private static final String TAG = "Main";
	
	private Client client = Client.getInstance();
	
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.main);
		client.setContext(this);
		
		this.listener = new ServiceListener() {
	    public void serviceAdded(ServiceEvent event) {
	        deviceList.add("Service added   : " + event.getName() + "."
	                + event.getType());
	        Log.v(TAG, "Service added   : " + event.getName() + "."
	                + event.getType());
	    }

	    public void serviceRemoved(ServiceEvent event) {
	        deviceList.add("Service removed : " + event.getName() + "."
	                + event.getType());
	        Log.v(TAG, "Service removed : " + event.getName() + "."
	                + event.getType());
	    }

	    public void serviceResolved(ServiceEvent event) {
	        deviceList.add("Service resolved: " + event.getInfo());
	        Log.v(TAG, "Service resolved: " + event.getInfo());
	    }
	};
	}
	
	protected void onResume() {
  	super.onResume();
  }
  
  protected void onPause() {
  	super.onPause();
  }
  
  public void showAllPrinters() {
  	try {
  		WifiManager wifi = (WifiManager) getSystemService(Context.WIFI_SERVICE);
  		lock = wifi.createMulticastLock("fliing_lock");
  		lock.setReferenceCounted(true);
  		lock.acquire();
  		
  		InetAddress inetAddress = getLocalIpAddress();
  		jmdns = JmDNS.create(inetAddress, "TEST");
  		
  		ServiceInfo[] infos = jmdns.list("_balibot._tcp.");
  		
  		if (infos != null && infos.length > 0) {
  			for (int i = 0; i < infos.length; i++) {
  				deviceList.add(infos[i].getName());
  			}
  		} else {
  			deviceList.add("No device found.");
  		}
  		impl = (JmDNSImpl) jmdns;
  	} catch (IOException e) {
  		e.printStackTrace();
  	}
  }
  
  public InetAddress getLocalIpAddress() {
  	try {
  		for (Enumeration<NetworkInterface> en = NetworkInterface
  				.getNetworkInterfaces(); en.hasMoreElements();) {
  			NetworkInterface intf = (NetworkInterface) en.nextElement();
  			for (Enumeration<InetAddress> enumIpAddr = intf
  					.getInetAddresses(); enumIpAddr.hasMoreElements();) {
  				InetAddress inetAddress = (InetAddress) enumIpAddr.nextElement();
  				if (!inetAddress.isLoopbackAddress()) {
  					return inetAddress;
  				}
  			}
  		}
  	} catch (SocketException ex) {
  		ex.printStackTrace();
  	}
  	return null;
  }
  
	public void _connect(View view) {
		Button connect = (Button) findViewById(R.id.connect);
		// Already connected -> Disconnect
		if (client.isConnected()) {
			connect.setText("Connect");
			client.disconnect();
		} else {
			if (client.connect("192.168.1.87", 9090)) {
				Vibrator vibrator = (Vibrator)getSystemService(Context.VIBRATOR_SERVICE);
        vibrator.vibrate(400);
				connect.setText("Disconnect");
			}
		}
	}
}