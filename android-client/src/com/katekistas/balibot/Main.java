package com.katekistas.balibot;

import java.io.IOException;
import java.net.Inet4Address;
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
import android.net.wifi.WifiManager;
import android.net.wifi.WifiManager.MulticastLock;
import android.os.Bundle;
import android.os.Vibrator;
import android.util.Log;
import android.view.View;
import android.widget.Button;

public class Main extends Activity {
	private JmDNS jmdns;
	MulticastLock lock;
	protected ServiceListener listener;

	private static final String TAG = "Main";
	private static final String MDNS_TYPE = "_balibot._tcp.local.";
	
	private Inet4Address serverAddress;
	private int serverPort;
	
	private Client client = Client.getInstance();
	
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.main);
		client.setContext(this);
		findServers();
	}
	
	protected void onDestroy() {
		super.onDestroy();
		if (lock != null) lock.release();
	}
	
	protected void onResume() {
		super.onResume();
  }
	
	protected void onPause() {
		super.onPause();
	}
	
	public void findServers() {
		try {
			WifiManager wifi = (WifiManager) getSystemService(Context.WIFI_SERVICE);
			lock = wifi.createMulticastLock("HeeereDnssdLock");
			lock.setReferenceCounted(true);
			lock.acquire();
			
			jmdns = JmDNS.create();
			jmdns.addServiceListener(MDNS_TYPE, listener = new ServiceListener() {
				public void serviceAdded(ServiceEvent event) {
					Log.v(TAG, "Service added: "+event.getName()+"."+event.getType());
				}
				public void serviceRemoved(ServiceEvent event) {
					Log.v(TAG, "Service removed: "+event.getName()+"."+event.getType());
				}
				public void serviceResolved(ServiceEvent event) {
					Log.v(TAG, "Service resolved: " + event.getInfo());
				}
			});
			ServiceInfo[] infos = jmdns.list(MDNS_TYPE);
			if (infos != null && infos.length > 0) {
				for (int i=0; i<infos.length; i++) {
					serverAddress = infos[i].getInet4Addresses()[0];
					serverPort = infos[i].getPort();
					Log.d(TAG, "Encontrei "+serverAddress.getHostAddress()+" "+serverPort);
				}
			} else {
				Log.d(TAG, "ENCONTREI NADA");
			}
			jmdns.removeServiceListener(MDNS_TYPE, listener);
	    jmdns.close();
	    
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
  
	public void _connect(View view) {
		Button connect = (Button) findViewById(R.id.connect);
		// Already connected -> Disconnect
		if (client.isConnected()) {
			connect.setText("Connect");
			client.disconnect();
		} else {
			if (client.connect(serverAddress.getHostAddress(), serverPort)) {
				Vibrator vibrator = (Vibrator)getSystemService(Context.VIBRATOR_SERVICE);
        vibrator.vibrate(400);
				connect.setText("Disconnect");
			}
		}
	}
}