import os
import requests
from dotenv import load_dotenv
import json
import time

load_dotenv('config.env')

class SteamInventory:
    def __init__(self):
        self.api_key = os.getenv('STEAM_API_KEY')
        if not self.api_key:
            raise ValueError("STEAM_API_KEY not found in config.env")
        self.base_url = 'https://steamcommunity.com'

    def get_cs2_inventory(self, steam_id):
        """
        Fetch CS2 inventory for a given Steam ID using the Steam Web API
        """
        # Clean up the steam_id input
        steam_id = steam_id.strip('/')
        if '/id/' in steam_id:
            steam_id = steam_id.split('/id/')[-1]
        elif '/profiles/' in steam_id:
            steam_id = steam_id.split('/profiles/')[-1]
            
        print(f"Processing Steam ID: {steam_id}")  # Debug log
        
        # If it's not a numeric ID, try to resolve the vanity URL
        if not steam_id.isdigit():
            resolved_id = self._resolve_vanity_url(steam_id)
            if resolved_id:
                steam_id = resolved_id
                print(f"Resolved vanity URL to Steam ID: {steam_id}")  # Debug log
            else:
                return {'error': f'Could not resolve vanity URL: {steam_id}'}

        # Get inventory using Steam Web API
        inventory = self._get_inventory_web_api(steam_id)
        if inventory.get('error'):
            return inventory

        return inventory

    def _get_inventory_web_api(self, steam_id):
        """
        Get inventory using Steam Web API
        """
        # First try the IInventoryService API
        endpoint = f'https://api.steampowered.com/IInventoryService/GetInventory/v1/'
        params = {
            'key': self.api_key,
            'steamid': steam_id,
            'appid': 730,  # CS2 App ID
            'contextid': 2,
            'get_descriptions': 1
        }
        
        try:
            print(f"Trying Steam Web API endpoint: {endpoint}")  # Debug log
            response = requests.get(endpoint, params=params)
            print(f"Response status: {response.status_code}")  # Debug log
            print(f"Response headers: {dict(response.headers)}")  # Debug log
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response data: {json.dumps(data, indent=2)[:500]}...")  # Debug log
                
                if data.get('response', {}).get('items'):
                    items = data['response']['items']
                    descriptions = data['response'].get('descriptions', [])
                    
                    # Convert to our expected format
                    inventory_data = {
                        'assets': {str(i): item for i, item in enumerate(items)},
                        'descriptions': {str(i): desc for i, desc in enumerate(descriptions)}
                    }
                    return inventory_data
                else:
                    print("No items found in response")
            
            # If that fails, try the community endpoint
            return self._try_community_endpoints(steam_id)
            
        except Exception as e:
            print(f"Error with Steam Web API: {str(e)}")  # Debug log
            # Fall back to community endpoints
            return self._try_community_endpoints(steam_id)

    def _try_community_endpoints(self, steam_id):
        """
        Try different community endpoints as fallback
        """
        endpoints = [
            f'https://steamcommunity.com/inventory/{steam_id}/730/2?l=english&count=5000',
            f'https://steamcommunity.com/profiles/{steam_id}/inventory/json/730/2?l=english&count=5000',
            f'https://steamcommunity.com/id/{steam_id}/inventory/json/730/2?l=english&count=5000'
        ]

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        }

        for endpoint in endpoints:
            try:
                print(f"\nTrying community endpoint: {endpoint}")  # Debug log
                
                # Add a small delay to avoid rate limiting
                time.sleep(1)
                
                response = requests.get(endpoint, headers=headers)
                print(f"Response status: {response.status_code}")  # Debug log
                print(f"Response headers: {dict(response.headers)}")  # Debug log
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"Response data keys: {list(data.keys())}")  # Debug log
                    
                    # Handle different response formats
                    if data.get('success') == 1 or data.get('success') is True:
                        inventory_data = {
                            'assets': data.get('rgInventory', data.get('assets', {})),
                            'descriptions': data.get('rgDescriptions', data.get('descriptions', {}))
                        }
                        
                        if not inventory_data['assets']:
                            continue
                            
                        print(f"Successfully retrieved {len(inventory_data['assets'])} items")
                        return inventory_data
                    
            except Exception as e:
                print(f"Error with endpoint {endpoint}: {str(e)}")
                continue

        return {'error': 'Could not fetch inventory. Please ensure your inventory is public and try again.'}

    def _resolve_vanity_url(self, vanity_url):
        """
        Resolve a Steam vanity URL to a Steam64 ID
        """
        api_endpoint = 'https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/'
        params = {
            'key': self.api_key,
            'vanityurl': vanity_url
        }
        
        try:
            print(f"Resolving vanity URL: {vanity_url}")  # Debug log
            response = requests.get(api_endpoint, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data['response']['success'] == 1:
                steam_id = data['response']['steamid']
                print(f"Successfully resolved to Steam ID: {steam_id}")  # Debug log
                return steam_id
            else:
                print(f"Failed to resolve vanity URL. Response: {json.dumps(data)}")  # Debug log
            return None
        except Exception as e:
            print(f"Error resolving vanity URL: {str(e)}")  # Debug log
            return None

    def get_item_market_price(self, market_hash_name):
        """
        Fetch current market price for an item from Steam Community Market
        """
        endpoint = f'{self.base_url}/market/priceoverview'
        params = {
            'appid': 730,  # CS2 App ID
            'currency': 23,  # DKK currency code
            'market_hash_name': market_hash_name
        }
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        try:
            response = requests.get(endpoint, params=params, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching market price: {e}")
            return {'error': str(e)}

    def get_item_details(self, class_id, instance_id):
        """
        Fetch detailed information about a specific item
        """
        endpoint = f'{self.base_url}/economy/itemclasshover/730/{class_id}/{instance_id}'
        params = {
            'language': 'english',
            'currency': 23  # DKK currency code
        }
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        try:
            response = requests.get(endpoint, params=params, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching item details: {e}")
            return {'error': str(e)}

    def _get_player_profile(self, steam_id):
        """
        Get player profile information to check privacy settings
        """
        if not steam_id.isdigit():
            resolved_id = self._resolve_vanity_url(steam_id)
            if resolved_id:
                steam_id = resolved_id
            else:
                return None

        api_endpoint = 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/'
        params = {
            'key': self.api_key,
            'steamids': steam_id
        }
        
        try:
            print(f"Fetching profile for Steam ID: {steam_id}")  # Debug log
            response = requests.get(api_endpoint, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data['response']['players']:
                player = data['response']['players'][0]
                print(f"Profile visibility state: {player.get('communityvisibilitystate')}")  # Debug log
                return player
            return None
        except Exception as e:
            print(f"Error fetching profile: {str(e)}")  # Debug log
            return None
